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
  Delete,
  Patch,
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
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';

@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
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
  getAllProducts(
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('provinces') provinces?: string,
    @Query('categories') categories?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('userId') userId?: string,
    @Query('searchHistory') searchHistory?: string,
    @Query('viewHistory') viewHistory?: string,
  ) {
    const provincesArray = provinces ? provinces.split(',') : undefined;
    const searchHistoryArray = searchHistory
      ? searchHistory.split(',')
      : undefined;
    const viewHistoryArray = viewHistory ? viewHistory.split(',') : undefined;
    const categoriesArray = categories
      ? (categories.split(',') as CategoryType[])
      : undefined;
    return this.productsService.getAllProducts({
      limit,
      page,
      search,
      provinces: provincesArray,
      categories: categoriesArray,
      minPrice,
      maxPrice,
      userId,
      searchHistory: searchHistoryArray,
      viewHistory: viewHistoryArray,
    });
  }

  @Get('count/category')
  getCountCategory(@Query('sellerId') sellerId?: string) {
    return this.productsService.getCountCategory(sellerId);
  }

  @Get('seller/top-rating')
  @UseGuards(JwtAuthGuard)
  getTopSellReviews(
    @CurrentUser() user: User,
    @Query('type', new DefaultValuePipe('year'))
    type: 'year' | 'month' | 'week',
  ) {
    if (!user.seller) {
      throw new BadRequestException('User is not a seller');
    }
    return this.productsService.getTopSellReviews(user.seller.id, type);
  }

  @Get('seller/top-trending')
  @UseGuards(JwtAuthGuard)
  getTopSellTrending(
    @CurrentUser() user: User,
    @Query('type', new DefaultValuePipe('year'))
    type: 'year' | 'month' | 'week',
  ) {
    if (!user.seller) {
      throw new BadRequestException('User is not a seller');
    }
    return this.productsService.getTopSellTrending(user.seller.id, type);
  }
  @Get('seller')
  getProductsAllSeller(
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('status') status?: SellProductType,
    @Query('category') category?: CategoryType,
    @Query('verifyStatus') verifyStatus?: VerifyOCOPStatus,
  ) {
    return this.productsService.getProductsBySellerId({
      limit,
      page,
      search,
      status,
      category,
      verifyStatus,
    });
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
    return this.productsService.getProductsBySellerId(
      {
        limit,
        page,
        search,
        status,
        category,
        verifyStatus,
      },
      id,
    );
  }

  @Get('similar/:id')
  getSimilarityProduct(@Param('id') id: string) {
    return this.productsService.getSimilarityProduct(id);
  }

  @Get('five-star')
  getFiveStar() {
    return this.productsService.getFiveStar();
  }

  @Get('popular')
  getPopularProducts() {
    return this.productsService.getPopularProducts({
      limit: 10,
      page: 1,
    });
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteProduct(@Param('id') id: string, @CurrentUser() user: User) {
    return this.productsService.deleteProduct(id, user.id);
  }

  @Patch(':id/quantity')
  @UseGuards(JwtAuthGuard)
  updateProductQuantity(
    @Param('id') id: string,
    @Body() body: { quantity: number },
    @CurrentUser() user: User,
  ) {
    if (!user.seller) {
      throw new BadRequestException('User is not a seller');
    }
    return this.productsService.addProductQuantity(id, body.quantity, user.id);
  }
}
