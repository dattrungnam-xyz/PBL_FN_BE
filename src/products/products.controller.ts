import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  BadRequestException,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDTO } from './dto/createProduct.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProductDTO } from './dto/updateProduct.dto';
import { JwtAuthGuard } from '../auth/authGuard.jwt';
import { CurrentUser } from '../common/decorator/currentUser.decorator';
import { User } from '../users/entity/user.entity';
import { CategoryType } from '../common/type/category.type';
import { SellProductType } from '../common/type/sellProduct.type';
import { VerifyOCOPStatus } from '../common/type/verifyOCOP.type';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Body() completeBody: CreateProductDTO,
    @CurrentUser() user: User,
  ) {
    if (!user.storeId) {
      throw new BadRequestException('Store ID is required');
    }
    if (completeBody.images) {
      const uploadedImages = await Promise.all(
        completeBody.images.map((image) =>
          this.cloudinaryService.uploadImageBase64(image),
        ),
      );
      completeBody.images = uploadedImages.map((image) => image.url);
    }
    return this.productsService.createProduct(user.storeId, completeBody);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() completeBody: UpdateProductDTO,
  ) {
    if (completeBody.images) {
      const uploadedImages = await Promise.all(
        completeBody.images.map((image) =>
          image.startsWith('data:image')
            ? this.cloudinaryService.uploadImageBase64(image)
            : image,
        ),
      );
      completeBody.images = uploadedImages.map((image) =>
        typeof image === 'string' ? image : image.url,
      );
    }
    return this.productsService.updateProduct(id, completeBody);
  }

  @Get()
  getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get('seller/:id')
  getProductsBySellerId(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('status') status?: SellProductType,
    @Query('category') category?: CategoryType,
    @Query('verifyStatus') verifyStatus?: VerifyOCOPStatus,
  ) {
    return this.productsService.getProductsBySellerId(id, {
      limit,
      page,
      search,
      status,
      category,
      verifyStatus,
    });
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }
}
