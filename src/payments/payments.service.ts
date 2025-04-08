import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entity/payment.entity';
import { CreatePaymentDTO } from './dto/createPayment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
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
}
