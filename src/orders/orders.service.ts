import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
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
import { User } from '../users/entity/user.entity';
import { CategoryType } from '../common/type/category.type';
@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UsersService,
    private readonly userAddressService: UserAddressService,
    private readonly sellerService: SellersService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
    private readonly orderDetailService: OrderDetailsService,
    private readonly productService: ProductsService,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
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
        'orderDetails.review',
      ],
      order: {
        createdAt: 'DESC',
      },
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
            OrderStatusType.REFUNDED,
          ]),
        ),
      },
      relations: ['payment'],
    });
    return {
      currentCycle: Math.round(
        currentCycleOrders.reduce(
          (acc, order) => acc + order.totalPrice - order.shippingFee,
          0,
        ),
      ),
      previousCycle: Math.round(
        previousCycleOrders.reduce(
          (acc, order) => acc + order.totalPrice - order.shippingFee,
          0,
        ),
      ),
      percentage: previousCycleOrders.reduce(
        (acc, order) => acc + order.totalPrice - order.shippingFee,
        0,
      )
        ? Math.round(
            (currentCycleOrders.reduce(
              (acc, order) => acc + order.totalPrice - order.shippingFee,
              0,
            ) /
              previousCycleOrders.reduce(
                (acc, order) => acc + order.totalPrice - order.shippingFee,
                0,
              )) *
              100,
          )
        : currentCycleOrders.reduce(
            (acc, order) => acc + order.totalPrice - order.shippingFee,
            0,
          )
        ? 100
        : 0,
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
      currentCycleTotalPrice: currentCycleOrders.reduce(
        (acc, order) => acc + order.totalPrice - order.shippingFee,
        0,
      ),
      previousCycleTotalPrice: previousCycleOrders.reduce(
        (acc, order) => acc + order.totalPrice - order.shippingFee,
        0,
      ),
      percentage: previousCycleOrders.length
        ? Math.round(
            (currentCycleOrders.length / previousCycleOrders.length) * 100,
          )
        : currentCycleOrders.length
        ? 100
        : 0,
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
        : currentCycleCustomerCount
        ? 100
        : 0,
    };
  }

  async getRevenueByTypeAndCategory(
    user: User,
    type: 'year' | 'month' | 'week',
  ) {
    if (!user.seller || !type) {
      throw new BadRequestException('User or type is required');
    }

    const { startDate, startDatePreviousCycle } = getDateCycle(type);
    const listCategory = Object.values(CategoryType);
    const listRevenue = [];
    for (const category of listCategory) {
      const listOrderDetail = await this.orderDetailRepository.find({
        where: {
          product: {
            category,
          },
          order: {
            seller: { id: user.seller.id },
            createdAt: MoreThan(startDate),
            orderStatus: Not(
              In([
                OrderStatusType.CANCELLED,
                OrderStatusType.REJECTED,
                OrderStatusType.REFUNDED,
              ]),
            ),
          },
        },
        relations: ['product'],
      });
      const revenue = listOrderDetail.reduce(
        (acc, orderDetail) =>
          acc + orderDetail.product.price * orderDetail.quantity,
        0,
      );

      const previousCycleOrderDetail = await this.orderDetailRepository.find({
        where: {
          product: {
            category,
          },
          order: {
            seller: { id: user.seller.id },
            createdAt: Between(startDatePreviousCycle, startDate),
            orderStatus: Not(
              In([
                OrderStatusType.CANCELLED,
                OrderStatusType.REJECTED,
                OrderStatusType.REFUNDED,
              ]),
            ),
          },
        },
        relations: ['product'],
      });
      const previousCycleRevenue = previousCycleOrderDetail.reduce(
        (acc, orderDetail) =>
          acc + orderDetail.product.price * orderDetail.quantity,
        0,
      );
      listRevenue.push({
        category,
        revenueCurrentCycle: revenue,
        revenuePreviousCycle: previousCycleRevenue,
        percentage: previousCycleRevenue
          ? Math.round((revenue / previousCycleRevenue) * 100)
          : revenue
          ? 100
          : 0,
      });
    }
    return listRevenue;
  }

  async getCustomerStatistics(sellerId: string) {
    const listCustomer = await this.orderRepository.find({
      where: {
        seller: { id: sellerId },
        payment: { paymentStatus: PaymentStatusType.PAID },
        orderStatus: Not(
          In([
            OrderStatusType.CANCELLED,
            OrderStatusType.REJECTED,
            OrderStatusType.REFUNDED,
          ]),
        ),
      },
      relations: ['user', 'orderDetails', 'orderDetails.review'],
    });
    const res = {
      totalCustomers: 0,
      avrgRevenue: 0,
      returningCustomers: 0,
      highlyRatedCustomers: 0,
    };
    if (!listCustomer.length) {
      return res;
    }
    res.avrgRevenue =
      listCustomer.reduce(
        (acc, order) => acc + order.totalPrice - order.shippingFee,
        0,
      ) / listCustomer.length;
    const customerOrderCount = new Map<string, number>();
    listCustomer.forEach((customer) => {
      const count = customerOrderCount.get(customer.user.id) || 0;
      customerOrderCount.set(customer.user.id, count + 1);
    });
    res.returningCustomers = Array.from(customerOrderCount.values()).filter(
      (count) => count > 1,
    ).length;
    res.totalCustomers = customerOrderCount.size;
    const satisfiedCustomer = listCustomer.filter((customer) =>
      customer.orderDetails.some(
        (orderDetail) => orderDetail.review?.rating >= 4,
      ),
    );
    res.highlyRatedCustomers = new Set(
      satisfiedCustomer.map((customer) => customer.user.id),
    ).size;
    return res;
  }

  async getRevenueFiveMonth(sellerId: string) {
    const endDate = new Date();
    endDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 5);

    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        "DATE_FORMAT(order.createdAt, '%Y-%m') as month",
        'SUM(order.totalPrice - order.shippingFee) as totalRevenue',
        'COUNT(order.id) as totalOrders',
      ])
      .where('order.seller.id = :sellerId', { sellerId })
      .andWhere(
        'order.createdAt >= :startDate AND order.createdAt < :endDate',
        {
          startDate,
          endDate,
        },
      )
      .andWhere('order.orderStatus NOT IN (:...statuses)', {
        statuses: [
          OrderStatusType.CANCELLED,
          OrderStatusType.REJECTED,
          OrderStatusType.REFUNDED,
        ],
      })
      .groupBy("DATE_FORMAT(order.createdAt, '%Y-%m')")
      .orderBy("DATE_FORMAT(order.createdAt, '%Y-%m')", 'ASC')
      .getRawMany();

    const months: string[] = [];
    const now = new Date(endDate);
    now.setMonth(now.getMonth());
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }

    const resultMap = new Map<
      string,
      { totalRevenue: number; totalOrders: number }
    >();
    result.forEach((item) => {
      resultMap.set(item.month, {
        totalRevenue: Number(item.totalRevenue) || 0,
        totalOrders: Number(item.totalOrders) || 0,
      });
    });

    return months.map((month) => {
      const data = resultMap.get(month);
      return {
        month,
        totalRevenue: data?.totalRevenue ?? 0,
        totalOrders: data?.totalOrders ?? 0,
        revenuePerCustomer: data?.totalRevenue
          ? data.totalRevenue / data.totalOrders
          : 0,
      };
    });
  }
}
