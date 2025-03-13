import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entity/product.entity';
import { ReviewMedia } from '../../review-media/entity/reviewMedia.entity';

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

  @OneToMany(()=> ReviewMedia, (media) => media.review)
  media: ReviewMedia[];
}
