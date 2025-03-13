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
import { Product } from '../../products/entity/product.entity';
import { User } from '../../users/entity/user.entity';

@Entity()
export class Cart {
  constructor(partial?: Partial<Cart>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @JoinTable()
  @ManyToMany(() => Product, (product) => product.carts)
  products: Product[];

  @ManyToOne(() => User, (user) => user.carts)
  user: User;

  @Expose()
  @Column()
  quantity: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
