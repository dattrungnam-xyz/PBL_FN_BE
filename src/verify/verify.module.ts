import { Module } from '@nestjs/common';
import { VerifyService } from './verify.service';
import { VerifyController } from './verify.controller';
import { Verify } from './entity/verify.entity';
import { Product } from '../products/entity/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Verify, Product]),
    forwardRef(() => ProductsModule),
    CloudinaryModule,
  ],
  controllers: [VerifyController],
  providers: [VerifyService],
  exports: [VerifyService],
})
export class VerifyModule {}
