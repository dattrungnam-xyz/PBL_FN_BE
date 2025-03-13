import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Seller } from '../../sellers/entity/seller.entity';
import { Category } from '../../categories/entity/category.entity';
import { Review } from '../../reviews/entity/review.entity';
import { ProductMedia } from '../../product-media/entity/productMedia.entity';
import { Cart } from '../../carts/entity/cart.entity';

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
  @Column({ type: 'longtext', nullable: true })
  details: string;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  usageInstructions: string;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  storageInstructions: string;

  @Expose()
  @Column()
  price: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ManyToOne(() => Seller, (seller) => seller.products)
  seller: Seller;

  @OneToMany(() => ProductMedia, (productImage) => productImage.product)
  images: ProductMedia[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @ManyToMany(() => Cart, (cart) => cart.products)
  carts: Cart[];
}
