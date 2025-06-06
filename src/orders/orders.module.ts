import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderDetail } from '../order-details/entity/orderDetail.entity';
import { UsersModule } from '../users/users.module';
import { SellersModule } from '../sellers/sellers.module';
import { UserAddressModule } from '../user-address/user-address.module';
import { PaymentsModule } from '../payments/payments.module';
import { OrderDetailsModule } from '../order-details/order-details.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductsModule } from '../products/products.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail]),
    UsersModule,
    SellersModule,
    UserAddressModule,
    forwardRef(() => PaymentsModule),
    OrderDetailsModule,
    CloudinaryModule,
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
