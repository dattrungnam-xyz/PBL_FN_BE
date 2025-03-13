import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentMethodType } from '../../common/type/paymentMethod.type';
import { Order } from '../../orders/entity/order.entity';

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
    nullable: true,
  })
  transactionId: string;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;
}
