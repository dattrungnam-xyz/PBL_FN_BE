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
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VerifyOCOPStatus } from '../../common/type/verifyOCOP.type';
import { Product } from '../../products/entity/product.entity';
import { Paginated } from '../../pagination/paginator';


@Entity()
export class Verify {
  constructor(partial?: Partial<Verify>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: VerifyOCOPStatus,
    default: VerifyOCOPStatus.PENDING,
  })
  status: VerifyOCOPStatus;

  @Expose()
  @Column()
  star: number;

  @Expose()
  @Column()
  productName: string;

  @Expose()
  @Column()
  manufacturer: string;

  @Expose()
  @Column()
  verifyDate: Date;

  @Expose()
  @Column({ type: 'json', nullable: true })
  images: string[];

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToMany(() => Product, (product) => product.verify)
  @JoinTable()
  products: Product[];
}

export class PaginatedVerify extends Paginated<Verify>(Verify) {}
