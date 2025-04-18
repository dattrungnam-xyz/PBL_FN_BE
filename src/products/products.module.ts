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
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CloudinaryModule,
    SellersModule,
    forwardRef(() => VerifyModule),
    RestockingModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
