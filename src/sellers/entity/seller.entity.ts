import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Product } from '../../products/entity/product.entity';
import { Order } from '../../orders/entity/order.entity';

@Entity()
export class Seller {
  constructor(partial?: Partial<Seller>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column()
  phone: string;

  @Expose()
  @Column({ nullable: true })
  email: string;

  @Expose()
  @Column({ nullable: true })
  avatar: string;

  @Expose()
  @Column({ nullable: true })
  banner: string;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  description: string;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  address: string;

  @Expose()
  @Column({ nullable: true })
  province: string;

  @Expose()
  @Column({ nullable: true })
  district: string;

  @Expose()
  @Column({ nullable: true })
  ward: string;
  

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @JoinColumn()
  @OneToOne(() => User, (user) => user.seller)
  user: User;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @OneToMany(() => Order, (order) => order.seller)
  orders: Order[];
}
