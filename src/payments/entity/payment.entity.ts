import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { PaymentMethodType } from '../../common/type/paymentMethod.type';
import { Order } from '../../orders/entity/order.entity';
import { PaymentStatusType } from '../../common/type/paymentStatus.type';

@Entity()
export class Payment {
  constructor(partial?: Partial<Payment>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    default: PaymentMethodType.CASH_ON_DELIVERY,
  })
  paymentMethod: PaymentMethodType;

  @Expose()
  @Column({
    type: 'enum',
    enum: PaymentStatusType,
    default: PaymentStatusType.UNPAID,
  })
  paymentStatus: PaymentStatusType;

  @Expose()
  @Column({
    nullable: true,
  })
  transactionId: string;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @JoinColumn()
  @OneToOne(() => Order, (order) => order.payment)
  order: Order;
}
