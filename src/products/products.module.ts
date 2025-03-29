import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SellersModule } from '../sellers/sellers.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CloudinaryModule,
    SellersModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
