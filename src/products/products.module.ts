import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SellersModule } from '../sellers/sellers.module';
import { forwardRef } from '@nestjs/common';
import { VerifyModule } from '../verify/verify.module';
import { RestockingModule } from '../restocking/restocking.module';
import { RedisModule } from '../redis/redis.module';
import { User } from '../users/entity/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User]),
    CloudinaryModule,
    SellersModule,
    forwardRef(() => VerifyModule),
    RestockingModule,
    RedisModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
