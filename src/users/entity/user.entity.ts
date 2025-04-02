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
import { Role } from '../../common/type/role.type';
import { RefreshToken } from './refreshToken.entity';
import { Seller } from '../../sellers/entity/seller.entity';
import { Order } from '../../orders/entity/order.entity';
import { Cart } from '../../carts/entity/cart.entity';
import { Review } from '../../reviews/entity/review.entity';
import { UserAddress } from '../../user-address/entity/userAddress.entity';
@Entity()
export class User {
  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: true })
  username: string;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({ unique: true })
  email: string;

  @Expose()
  @Column({ nullable: true })
  avatar: string;

  @Expose()
  @Column({ nullable: true, length: 11 })
  phone: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  password: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  passwordChangedAt: Date;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  passwordResetToken: String;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column('simple-array')
  roles: Role[];

  @Column({ default: true })
  isActive: boolean;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    nullable: true,
  })
  refreshTokens: RefreshToken[];

  @OneToOne(() => Seller, (seller) => seller.user, { nullable: true })
  seller: Seller;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => UserAddress, (userAddress) => userAddress.user)
  addresses: UserAddress[];

  storeId: string;
}
