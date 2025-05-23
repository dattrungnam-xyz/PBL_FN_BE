import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entity/product.entity';
import { User } from '../../users/entity/user.entity';
import { OrderDetail } from '../../order-details/entity/orderDetail.entity';
import { Paginated } from '../../pagination/paginator';
@Entity()
export class Review {
  constructor(partial?: Partial<Review>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  rating: number;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  description: string;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Product, (product) => product.reviews)
  product: Product;

  @Expose()
  @Column({ type: 'json', nullable: true })
  media: string[];

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;

  @OneToOne(() => OrderDetail, (orderDetail) => orderDetail.review)
  @JoinColumn()
  orderDetail: OrderDetail;
}

export class PaginatedReview extends Paginated<Review>(Review) {}
