import * as moment from 'moment';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entity/payment.entity';
import { CreatePaymentDTO } from './dto/createPayment.dto';
import { CreateZaloPaymentDTO } from './dto/createZaloPayment.dto';
import { ZaloPayCallbackDTO } from './dto/zaloPayCallback.dto';
import { PaymentStatusType } from '../common/type/paymentStatus.type';
import { OrdersService } from '../orders/orders.service';
import { OrderStatusType } from '../common/type/orderStatus.type';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService,
  ) {}

  async createPayment(createPaymentDTO: CreatePaymentDTO) {
    const payment = new Payment();
    payment.paymentMethod = createPaymentDTO.paymentMethod;
    if (createPaymentDTO.paymentStatus) {
      payment.paymentStatus = createPaymentDTO.paymentStatus;
    }
    if (createPaymentDTO.transactionId) {
      payment.transactionId = createPaymentDTO.transactionId;
    }
    return this.paymentRepository.save(payment);
  }

  async getPayment(id: string) {
    return this.paymentRepository.findOne({ where: { id } });
  }

  async getPayments() {
    return this.paymentRepository.find();
  }
  async createZaloPayment(createZaloPaymentDTO: CreateZaloPaymentDTO) {
    const { orderId, amount, paymentMethod } = createZaloPaymentDTO;

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;
    const payment = await this.paymentRepository.findOne({
      where: { order: { id: orderId } },
    });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    payment.transactionId = app_trans_id;
    await this.paymentRepository.save(payment);
    const embed_data = {
      redirecturl: `${process.env.ZALOPAY_RETURN_URL}?orderId=${app_trans_id}&paymentMethod=${paymentMethod}&orderIdpayment=${app_trans_id}`,
    };

    const order = {
      app_id: process.env.ZALOPAY_APP_ID,
      app_trans_id: app_trans_id,
      app_user: 'user123',
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      //khi thanh toán xong, zalopay server sẽ POST đến url này để thông báo cho server của mình
      //Chú ý: cần dùng ngrok để public url thì Zalopay Server mới call đến được
      callback_url: `${process.env.ZALOPAY_NGROK_URL}/api/v1/payments/zalopay/callback`,
      description: `OCOP Mart - Payment for the order #${transID}`,
      bank_code: '',
      mac: '',
    };

    const data =
      process.env.ZALOPAY_APP_ID +
      '|' +
      order.app_trans_id +
      '|' +
      order.app_user +
      '|' +
      order.amount +
      '|' +
      order.app_time +
      '|' +
      order.embed_data +
      '|' +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, process.env.ZALOPAY_KEY1).toString();
    try {
      const response = await axios.post(process.env.ZALOPAY_API_URL, null, {
        params: order,
      });
      return response.data;
    } catch (error) {
      throw new BadRequestException(error.response.data);
    }
  }

  async zaloPayCallback(zaloPayCallbackDTO: ZaloPayCallbackDTO) {
    type ZaloCallbackResult = {
      return_code: number;
      return_message: string;
    };
    let result: ZaloCallbackResult = {
      return_code: 1,
      return_message: 'success',
    };
    console.log(zaloPayCallbackDTO, "callback")
    try {
      const { data, mac: reqMac } = zaloPayCallbackDTO;

      const mac = CryptoJS.HmacSHA256(
        data,
        process.env.ZALOPAY_KEY2,
      ).toString();
      if (mac !== reqMac) {
        result.return_code = -1;
        result.return_message = 'mac not equal';
      } else {
        let dataJson = JSON.parse(data, process.env.ZALOPAY_KEY2 as any);
        const payment = await this.paymentRepository.findOne({
          where: { transactionId: dataJson['app_trans_id'] },
          relations: ['order'],
        });
        console.log(payment, "callback")
        if (payment) {
          payment.paymentStatus = PaymentStatusType.PAID;
          await this.paymentRepository.save(payment);
          await this.orderService.updateOrderStatus(payment.order.id, {
            status: OrderStatusType.PENDING,
          });
        }
        result.return_code = 1;
        result.return_message = 'success';
      }
    } catch (error) {
      result.return_code = 0;
      result.return_message = error.message;
    }
    return result;
  }

  async updatePaymentByOrderId(orderId: string, paymentStatus: PaymentStatusType) {
    const payment = await this.paymentRepository.findOne({
      where: { order: { id: orderId } },
    });
    if(!payment) {
      throw new BadRequestException('Payment not found');
    }
    payment.paymentStatus = paymentStatus;
    await this.paymentRepository.save(payment);
  }
}

/*
// APP INFO, STK TEST: 4111 1111 1111 1111
const config = {
  app_id: '2553',
  key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
  key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
};
*/
