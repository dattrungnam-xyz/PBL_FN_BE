import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Paginated } from '../../pagination/paginator';
import { Product } from '../../products/entity/product.entity';
import { User } from '../../users/entity/user.entity';
import { Seller } from '../../sellers/entity/seller.entity';

@Entity()
export class Restocking {
  constructor(partial?: Partial<Restocking>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  quantity: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Seller, (seller) => seller.restockings)
  seller: Seller;

  @ManyToOne(() => Product, (product) => product.restockings)
  product: Product;
}

export class PaginatedRestocking extends Paginated<Restocking>(Restocking) {}
