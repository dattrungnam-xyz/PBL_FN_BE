import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Product } from '../products/entity/product.entity';
import { UserViewHistory } from '../user-view-histories/entity/userViewHistory.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Product, UserViewHistory]), CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
