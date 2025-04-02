import { Module } from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { UserAddressController } from './user-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddress } from './entity/userAddress.entity';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([UserAddress]), UsersModule],
  controllers: [UserAddressController],
  providers: [UserAddressService],
  exports: [UserAddressService],
})
export class UserAddressModule {}
