import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entity/cart.entity';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
@Module({
  imports: [TypeOrmModule.forFeature([Cart]), UsersModule, ProductsModule],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
