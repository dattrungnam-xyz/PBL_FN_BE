import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
    if(createReviewDTO.media)
    {
      const uploadedImages = await Promise.all(
        createReviewDTO.media.map((image) =>
          this.cloudinaryService.uploadImageBase64(image),
        ),
      );
      createReviewDTO.media = uploadedImages.map((image) => image.url);
    }
    return this.reviewsService.createReview(user.id, createReviewDTO);
  }
}
