import { Module } from '@nestjs/common';
import { RestockingService } from './restocking.service';
import { RestockingController } from './restocking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restocking } from './entity/restocking.entity';
import { Product } from '../products/entity/product.entity';
import { Seller } from '../sellers/entity/seller.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restocking, Seller, Product])],
  controllers: [RestockingController],
  providers: [RestockingService],
  exports: [RestockingService],
})
export class RestockingModule {}
