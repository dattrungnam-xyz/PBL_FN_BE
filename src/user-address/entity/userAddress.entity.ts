import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { UserAddressType } from '../../common/type/userAddress.type';

@Entity()
export class UserAddress {
  constructor(partial?: Partial<UserAddress>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: UserAddressType,
    default: UserAddressType.HOME,
  })
  type: UserAddressType;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column()
  phone: string;

  @Expose()
  @Column({ default: false })
  isDefault: boolean;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  address: string;

  @Expose()
  @Column({ type: 'longtext', nullable: true })
  textAddress: string;

  @Expose()
  @Column({ nullable: true })
  province: string;

  @Expose()
  @Column({ nullable: true })
  district: string;

  @Expose()
  @Column({ nullable: true })
  ward: string;

  @ManyToOne(() => User, (user) => user.addresses)
  user: User;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
