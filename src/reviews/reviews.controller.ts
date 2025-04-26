import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Delete,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDTO } from './dto/createReview.dto';
import { JwtAuthGuard } from '../auth/authGuard.jwt';
import { CurrentUser } from '../common/decorator/currentUser.decorator';
import { User } from '../users/entity/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Body() createReviewDTO: CreateReviewDTO,
    @CurrentUser() user: User,
  ) {
    if (createReviewDTO.media) {
      const uploadedImages = await Promise.all(
        createReviewDTO.media.map((image) =>
          this.cloudinaryService.uploadImageBase64(image),
        ),
      );
      createReviewDTO.media = uploadedImages.map((image) => image.url);
    }
    return this.reviewsService.createReview(user.id, createReviewDTO);
  }

  @Get('analysis/review')
  @UseGuards(JwtAuthGuard)
  async getReviewCount(
    @CurrentUser() user: User,
    @Query('type') type: 'year' | 'month' | 'week',
  ) {
    if (!user.seller || !type) {
      return {
        currentCycle: 0,
        previousCycle: 0,
        percentage: 0,
      };
    }
    return this.reviewsService.getReviewCountByType(user.seller.id, type);
  }
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@CurrentUser() user: User) {
    return this.reviewsService.getStatistics(user.seller.id);
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard)
  async getRecentReviews(@CurrentUser() user: User) {
    return this.reviewsService.getRecentReviews(user.seller.id);
  }

  @Get('average')
  @UseGuards(JwtAuthGuard)
  async getAverageReviews() {
    return this.reviewsService.getAverageReviews();
  }

  @Get('seller')
  @UseGuards(JwtAuthGuard)
  async getSellerReviews(
    @CurrentUser() user: User,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('productId') productId?: string,
    @Query('rating') rating?: number,
  ) {
    return this.reviewsService.getSellerReviews(user.seller.id, {
      limit,
      page,
      search,
      productId,
      rating,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.deleteReview(id, user.id);
  }
}
