import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../common/type/role.type';
import { RefreshToken } from './refreshToken.entity';

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

  @Expose()
  @Column({ nullable: true })
  targetScore: number;

  @Expose()
  @Column({ nullable: true })
  testDate: Date;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  password: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  passwordChangedAt: Date;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  passwordResetToken: String;

  // @Exclude({ toPlainOnly: true })
  // @Column('simple-array', { nullable: true })
  // refreshToken: string[];

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column('simple-array')
  roles: Role[];

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
  @Expose()
  @Column({ default: true })
  isActive: boolean;
}
