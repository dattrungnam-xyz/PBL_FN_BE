import { Module } from '@nestjs/common';
import { ProductMediaService } from './product-media.service';
import { ProductMediaController } from './product-media.controller';

@Module({
  controllers: [ProductMediaController],
  providers: [ProductMediaService],
})
export class ProductMediaModule {}
