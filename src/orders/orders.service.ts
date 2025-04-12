import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Order, PaginatedOrder } from './entity/order.entity';
import { CreateOrderDTO } from './dto/createOrder.dto';
import { OrderStatusType } from '../common/type/orderStatus.type';
import { UsersService } from '../users/users.service';
import { SellersService } from '../sellers/sellers.service';
import { UserAddressService } from '../user-address/user-address.service';
import { PaymentsService } from '../payments/payments.service';
import { CreatePaymentDTO } from '../payments/dto/createPayment.dto';
import { OrderDetail } from '../order-details/entity/orderDetail.entity';
import { OrderDetailsService } from '../order-details/order-details.service';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { PaginatedProduct } from '../products/entity/product.entity';
import { paginate } from '../pagination/paginator';
import { Brackets } from 'typeorm';
import { UpdateOrderStatusDTO } from './dto/updateOrderStatus.dto';
import { UpdateOrdersStatusDTO } from './dto/updateOrdersStatus.dto';
import { RejectOrderDTO } from './dto/rejectOrder.dto';
import { RequestCancelDTO } from './dto/requestCancel.dto';
import { RequestRefundDTO } from './dto/requestRefund.dto';
import { ProductsService } from '../products/products.service';
import { PaymentStatusType } from '../common/type/paymentStatus.type';
import { getDateCycle } from '../utils/generateDateCycle';
@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UsersService,
    private readonly userAddressService: UserAddressService,
    private readonly sellerService: SellersService,
    private readonly paymentService: PaymentsService,
    private readonly orderDetailService: OrderDetailsService,
    private readonly productService: ProductsService,
  ) {}

  async createOrder(userId: string, createOrderDTO: CreateOrderDTO) {
    const order = new Order();
    order.totalPrice = createOrderDTO.totalPrice;
    order.orderStatus = OrderStatusType.PENDING_PAYMENT;
    order.shippingFee = createOrderDTO.shippingFee;
    order.note = createOrderDTO.note;
    const user = await this.userService.findOneById(userId);
    const address = await this.userAddressService.findOneById(
      createOrderDTO.addressId,
    );
    const seller = await this.sellerService.getSellerById(
      createOrderDTO.sellerId,
    );
    if (!user || !address || !seller) {
      throw new NotFoundException('User, address or seller not found');
    }
    order.user = user;
    order.address = address;
    order.seller = seller;
    const payment = await this.paymentService.createPayment({
      paymentMethod: createOrderDTO.paymentMethod,
    } as CreatePaymentDTO);
    order.payment = payment;

    const orderDetails = createOrderDTO.orderDetails.map((orderDetail) => {
      return this.orderDetailService.createOrderDetail(userId, orderDetail);
    });

    order.orderDetails = await Promise.all(orderDetails);

    return this.orderRepository.save(order);
  }

  async getOrdersByUserId(userId: string) {
    return this.orderRepository.find({
      where: {
        user: { id: userId },
      },
      relations: [
        'orderDetails',
        'payment',
        'address',
        'seller',
        'user',
        'orderDetails.product',
      ],
    });
  }

  async getShopOrder(
    id: string,
    {
      search,
      limit,
      page,
      orderStatus,
      province,
      district,
      ward,
      startDate,
      endDate,
    }: {
      search?: string;
      orderStatus?: OrderStatusType;
      limit: number;
      page: number;
      province?: string;
      district?: string;
      ward?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const offset = page * limit;
    let qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.orderDetails', 'orderDetails')
      .leftJoinAndSelect('orderDetails.product', 'product')
      .leftJoinAndSelect('order.payment', 'payment')
      .where('seller.id = :id', { id })
      .andWhere('order.deletedAt IS NULL')
      .orderBy('order.createdAt', 'DESC');
    if (search.trim() !== '') {
      qb = qb.andWhere(
        new Brackets((qb) => {
          qb.where('user.name LIKE :search', {
            search: `%${search.trim()}%`,
          }).orWhere(
            `EXISTS (
                  SELECT 1 FROM order_detail od
                  INNER JOIN product p ON p.id = od.productId
                  WHERE od.orderId = order.id AND p.name LIKE :search
                )`,
            { search: `%${search.trim()}%` },
          );
        }),
      );
    }

    if (orderStatus) {
      qb = qb.andWhere('order.orderStatus = :orderStatus', { orderStatus });
    }
    if (province) {
      qb = qb.andWhere('address.province = :province', { province });
    }
    if (district) {
      qb = qb.andWhere('address.district = :district', { district });
    }
    if (ward) {
      qb = qb.andWhere('address.ward = :ward', { ward });
    }
    if (startDate) {
      qb = qb.andWhere('order.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      const newEndDate = new Date(endDate);
      newEndDate.setHours(23, 59, 59, 999);
      qb = qb.andWhere('order.createdAt <= :endDate', {
        endDate: newEndDate,
      });
    }
    return await paginate<Order, PaginatedOrder>(qb, PaginatedOrder, {
      limit,
      page,
      total: true,
    });
  }

  async updateOrderStatus(
    id: string,
    updateOrderStatusDTO: UpdateOrderStatusDTO,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (
      updateOrderStatusDTO.status === OrderStatusType.REQUIRE_CANCEL &&
      order.orderStatus !== OrderStatusType.PENDING_PAYMENT &&
      order.orderStatus !== OrderStatusType.PENDING
    ) {
      throw new BadRequestException(
        'Cannot cancel order that is not pending payment or pending',
      );
    }
    if (
      updateOrderStatusDTO.status === OrderStatusType.REQUIRE_REFUND &&
      order.orderStatus !== OrderStatusType.COMPLETED &&
      order.orderStatus !== OrderStatusType.SHIPPING
    ) {
      throw new BadRequestException(
        'Cannot refund order that is not completed or shipping',
      );
    }

    order.orderStatus = updateOrderStatusDTO.status;
    return this.orderRepository.save(order);
  }

  async updateOrdersStatus(updateOrdersStatusDTO: UpdateOrdersStatusDTO) {
    const orders = await this.orderRepository.find({
      where: { id: In(updateOrdersStatusDTO.orderIds) },
    });
    orders.forEach((order) => {
      if (updateOrdersStatusDTO.status === OrderStatusType.REQUIRE_CANCEL) {
        if (
          order.orderStatus !== OrderStatusType.PENDING_PAYMENT &&
          order.orderStatus !== OrderStatusType.PENDING
        ) {
          throw new BadRequestException(
            'Cannot cancel order that is not pending payment or pending',
          );
        }
      }
      if (updateOrdersStatusDTO.status === OrderStatusType.REQUIRE_REFUND) {
        if (
          order.orderStatus !== OrderStatusType.COMPLETED &&
          order.orderStatus !== OrderStatusType.SHIPPING
        ) {
          throw new BadRequestException(
            'Cannot refund order that is not completed or shipping',
          );
        }
      }
      order.orderStatus = updateOrdersStatusDTO.status;
    });
    return this.orderRepository.save(orders);
  }

  async rejectOrder(id: string, rejectOrderDTO: RejectOrderDTO) {
    const order = await this.orderRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.rejectReason = rejectOrderDTO.reason;
    order.orderStatus = OrderStatusType.REJECTED;
    return this.orderRepository.save(order);
  }

  async requestCancel(id: string, requestCancelDTO: RequestCancelDTO) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderDetails', 'orderDetails.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (
      order.orderStatus !== OrderStatusType.PENDING &&
      order.orderStatus !== OrderStatusType.PENDING_PAYMENT
    ) {
      throw new BadRequestException(
        'Cannot cancel order that is not pending or pending payment',
      );
    }
    order.cancelReason = requestCancelDTO.cancelReason;

    if (order.orderStatus === OrderStatusType.PENDING_PAYMENT) {
      order.orderStatus = OrderStatusType.CANCELLED;
      order.orderDetails.forEach(async (orderDetail) => {
        const product = await this.productService.getProductById(
          orderDetail.product.id,
        );
        product.quantity += orderDetail.quantity;
        await this.productService.updateProductQuantity(
          product.id,
          product.quantity,
        );
      });
    } else {
      order.orderStatus = OrderStatusType.REQUIRE_CANCEL;
    }

    return this.orderRepository.save(order);
  }

  async requestRefund(id: string, requestRefundDTO: RequestRefundDTO) {
    const order = await this.orderRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (
      order.orderStatus !== OrderStatusType.COMPLETED &&
      order.orderStatus !== OrderStatusType.SHIPPING
    ) {
      throw new BadRequestException(
        'Cannot refund order that is not completed or shipping',
      );
    }
    order.refundReason = requestRefundDTO.refundReason;
    order.refundReasonImage = requestRefundDTO.refundReasonImage;
    order.orderStatus = OrderStatusType.REQUIRE_REFUND;
    return this.orderRepository.save(order);
  }

  async acceptCancel(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderDetails', 'orderDetails.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.orderStatus = OrderStatusType.CANCELLED;
    order.orderDetails.forEach(async (orderDetail) => {
      const product = await this.productService.getProductById(
        orderDetail.product.id,
      );
      product.quantity += orderDetail.quantity;
      await this.productService.updateProductQuantity(
        product.id,
        product.quantity,
      );
    });
    return this.orderRepository.save(order);
  }

  async acceptRefund(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.orderStatus = OrderStatusType.REFUNDED;
    //TODO: Refund money to user
    return this.orderRepository.save(order);
  }

  async rejectRefund(id: string, reason: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.orderStatus = OrderStatusType.REJECTED;
    order.rejectReason = reason;
    return this.orderRepository.save(order);
  }

  async getRevenueByType(sellerId: string, type: 'year' | 'month' | 'week') {
    const { startDate, startDatePreviousCycle } = getDateCycle(type);
    const currentCycleOrders = await this.orderRepository.find({
      where: {
        seller: { id: sellerId },
        payment: { paymentStatus: PaymentStatusType.PAID },
        createdAt: MoreThan(startDate),
        orderStatus: Not(
          In([
            OrderStatusType.CANCELLED,
            OrderStatusType.REJECTED,
            OrderStatusType.REQUIRE_CANCEL,
            OrderStatusType.REQUIRE_REFUND,
            OrderStatusType.REFUNDED,
          ]),
        ),
      },
      relations: ['payment'],
    });
    const previousCycleOrders = await this.orderRepository.find({
      where: {
        seller: { id: sellerId },
        payment: { paymentStatus: PaymentStatusType.PAID },
        createdAt: Between(startDatePreviousCycle, startDate),
        orderStatus: Not(
          In([
            OrderStatusType.CANCELLED,
            OrderStatusType.REJECTED,
            OrderStatusType.REQUIRE_CANCEL,
            OrderStatusType.REQUIRE_REFUND,
            OrderStatusType.REFUNDED,
          ]),
        ),
      },
      relations: ['payment'],
    });
    return {
      currentCycle: Math.round(
        currentCycleOrders.reduce((acc, order) => acc + order.totalPrice, 0),
      ),
      previousCycle: Math.round(
        previousCycleOrders.reduce((acc, order) => acc + order.totalPrice, 0),
      ),
      percentage: previousCycleOrders.reduce(
        (acc, order) => acc + order.totalPrice,
        0,
      )
        ? Math.round(
            (currentCycleOrders.reduce(
              (acc, order) => acc + order.totalPrice,
              0,
            ) /
              previousCycleOrders.reduce(
                (acc, order) => acc + order.totalPrice,
                0,
              )) *
              100,
          )
        : 100,
    };
  }

  async getOrderCountByType(sellerId: string, type: 'year' | 'month' | 'week') {
    const { startDate, startDatePreviousCycle } = getDateCycle(type);
    const currentCycleOrders = await this.orderRepository.find({
      where: {
        seller: { id: sellerId },
        createdAt: MoreThan(startDate),
        orderStatus: Not(
          In([OrderStatusType.CANCELLED, OrderStatusType.REJECTED]),
        ),
      },
    });
    const previousCycleOrders = await this.orderRepository.find({
      where: {
        seller: { id: sellerId },
        createdAt: Between(startDatePreviousCycle, startDate),
        orderStatus: Not(
          In([OrderStatusType.CANCELLED, OrderStatusType.REJECTED]),
        ),
      },
    });
    return {
      currentCycle: currentCycleOrders.length,
      previousCycle: previousCycleOrders.length,
      percentage: previousCycleOrders.length
        ? Math.round(
            (currentCycleOrders.length / previousCycleOrders.length) * 100,
          )
        : 100,
    };
  }

  async getCustomerCountByType(
    sellerId: string,
    type: 'year' | 'month' | 'week',
  ) {
    const { startDate, startDatePreviousCycle } = getDateCycle(type);
    const currentCycleCustomers = await this.orderRepository.find({
      where: {
        seller: { id: sellerId },
        createdAt: MoreThan(startDate),
        orderStatus: Not(
          In([OrderStatusType.CANCELLED, OrderStatusType.REJECTED]),
        ),
      },
      relations: ['user'],
    });
    const previousCycleCustomers = await this.orderRepository.find({
      where: {
        seller: { id: sellerId },
        createdAt: Between(startDatePreviousCycle, startDate),
        orderStatus: Not(
          In([OrderStatusType.CANCELLED, OrderStatusType.REJECTED]),
        ),
      },
      relations: ['user'],
    });
    const currentCycleCustomerCount = new Set(
      currentCycleCustomers.map((customer) => customer.user.id),
    ).size;
    const previousCycleCustomerCount = new Set(
      previousCycleCustomers.map((customer) => customer.user.id),
    ).size;
    return {
      currentCycle: currentCycleCustomerCount,
      previousCycle: previousCycleCustomerCount,
      percentage: previousCycleCustomerCount
        ? Math.round(
            (currentCycleCustomerCount / previousCycleCustomerCount) * 100,
          )
        : 100,
    };
  }
}
