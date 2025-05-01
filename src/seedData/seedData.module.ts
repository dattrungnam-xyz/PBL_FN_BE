import { Module } from '@nestjs/common';
import { SeedDataController } from './seedData.controller';
import { SeedDataService } from './seedData.service';
import { Product } from '../products/entity/product.entity';
import { User } from '../users/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from '../sellers/entity/seller.entity';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { SellersModule } from '../sellers/sellers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, Seller]),
    AuthModule,
    SellersModule,
    ProductsModule,
  ],
  controllers: [SeedDataController],
  providers: [SeedDataService],
  exports: [SeedDataService],
})
export class SeedDataModule {}
