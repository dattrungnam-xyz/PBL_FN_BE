import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshToken {
  constructor(partial?: Partial<RefreshToken>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  token: string;

  @Column({ nullable: false })
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;
}
