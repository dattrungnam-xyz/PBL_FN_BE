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
  totalPrice: number;

  @Expose()
  @Column({
    type: 'enum',
    enum: OrderStatusType,
    default: OrderStatusType.PENDING,
  })
  orderStatus: OrderStatusType;

  @Expose()
  @Column({
    type: 'enum',
    enum: PaymentStatusType,
    default: PaymentStatusType.PENDING,
  })
  paymentStatus: PaymentStatusType;

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
}
