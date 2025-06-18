import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatusType } from '../../common/type/orderStatus.type';
import { PaymentStatusType } from '../../common/type/paymentStatus.type';
import { User } from '../../users/entity/user.entity';
import { OrderDetail } from '../../order-details/entity/orderDetail.entity';
import { Payment } from '../../payments/entity/payment.entity';
import { Seller } from '../../sellers/entity/seller.entity';
import { UserAddress } from '../../user-address/entity/userAddress.entity';
import { Paginated } from '../../pagination/paginator';

@Entity()
export class Order {
  constructor(partial?: Partial<Order>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  shippingFee: number;

  @Expose()
  @Column()
  totalPrice: number;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  note: string;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  cancelReason: string;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  refundReason: string;

  @Expose()
  @Column({ type: 'json', nullable: true })
  refundReasonImage: string[];

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  rejectReason: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: OrderStatusType,
    default: OrderStatusType.PENDING_PAYMENT,
  })
  orderStatus: OrderStatusType;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Seller, (seller) => seller.orders)
  seller: Seller;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;

  @ManyToOne(() => UserAddress, (address) => address.orders)
  address: UserAddress;

  @Column({ nullable: true })
  shippingDate: Date;
}

export class PaginatedOrder extends Paginated<Order>(Order) {}
