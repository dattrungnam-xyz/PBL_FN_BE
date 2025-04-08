import { Module } from '@nestjs/common';
import { OrderDetailsService } from './order-details.service';
import { OrderDetailsController } from './order-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from './entity/orderDetail.entity';
import { ProductsModule } from '../products/products.module';
import { CartItemsModule } from '../cart-items/cart-items.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([OrderDetail]),
    ProductsModule,
    CartItemsModule,
  ],
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService],
  exports: [OrderDetailsService],
})
export class OrderDetailsModule {}
