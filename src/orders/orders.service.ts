import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async createOrder(userId: string, createOrderDTO: CreateOrderDTO) {
    const order = new Order();
    order.totalPrice = createOrderDTO.totalPrice;
    order.orderStatus = OrderStatusType.PENDING;
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

    order.orderStatus = updateOrderStatusDTO.status;
    return this.orderRepository.save(order);
  }
}
