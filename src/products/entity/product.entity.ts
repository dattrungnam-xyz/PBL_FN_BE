import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Seller } from '../../sellers/entity/seller.entity';
import { Review } from '../../reviews/entity/review.entity';
import { CategoryType } from '../../common/type/category.type';
import { SellProductType } from '../../common/type/sellProduct.type';
import { Paginated } from '../../pagination/paginator';
import { VerifyOCOPStatus } from '../../common/type/verifyOCOP.type';
import { Verify } from '../../verify/entity/verify.entity';
import { CartItems } from '../../cart-items/entity/cartItems.entity';
import { OrderDetail } from '../../order-details/entity/orderDetail.entity';
import { Restocking } from '../../restocking/entity/restocking.entity';
import { User } from '../../users/entity/user.entity';
@Entity()
export class Product {
  constructor(partial?: Partial<Product>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  description: string;

  @Expose()
  @Column()
  price: number;

  @Expose()
  @Column()
  star: number;

  @Expose()
  @Column({ type: 'enum', enum: CategoryType, default: CategoryType.FOOD })
  category: CategoryType;

  @Expose()
  @Column({
    type: 'enum',
    enum: SellProductType,
    default: SellProductType.SELLING,
  })
  status: SellProductType;

  @Expose()
  @Column()
  quantity: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Seller, (seller) => seller.products)
  seller: Seller;

  @Expose()
  @Column({ type: 'json', nullable: true })
  images: string[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @Expose()
  @Column({
    type: 'enum',
    enum: VerifyOCOPStatus,
    default: VerifyOCOPStatus.NOT_SUBMITTED,
  })
  verifyOcopStatus: VerifyOCOPStatus;

  @OneToMany(() => CartItems, (cartItem) => cartItem.product)
  cartItems: CartItems[];

  @ManyToMany(() => Verify, (verify) => verify.products)
  verify: Verify[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.product)
  orderDetails: OrderDetail[];

  @OneToMany(() => Restocking, (restocking) => restocking.product)
  restockings: Restocking[];

  @ManyToMany(() => User, (user) => user.viewHistorys)
  @JoinTable()
  userView: User;
}

export class PaginatedProduct extends Paginated<Product>(Product) {}
