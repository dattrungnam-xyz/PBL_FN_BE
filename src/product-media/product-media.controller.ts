import { Controller } from '@nestjs/common';
import { ProductMediaService } from './product-media.service';

@Controller('product-media')
export class ProductMediaController {
  constructor(private readonly productMediaService: ProductMediaService) {}
}
