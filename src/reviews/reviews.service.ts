import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entity/review.entity';
import { CreateReviewDTO } from './dto/createReview.dto';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { UpdateReviewDTO } from './dto/updateReview.dto';
@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private productService: ProductsService,
    private userService: UsersService,
  ) {}

  async createReview(
    userId: string,
    productId: string,
    createReviewDto: CreateReviewDTO,
  ) {
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const review = this.reviewRepository.create({
      ...createReviewDto,
      user,
      product,
    });
    return this.reviewRepository.save(review);
  }

  async getReviewsByProductId(productId: string) {
    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
    });
    return reviews;
  }

  async updateReview(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDTO,
  ) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, user: { id: userId } },
      relations: ['product', 'user'],
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.user.id !== userId) {
      throw new ForbiddenException('You are not allowed to update this review');
    }
    return this.reviewRepository.save({
      ...review,
      ...updateReviewDto,
    });
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, user: { id: userId } },
      relations: ['product', 'user'],
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.user.id !== userId) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }
    return this.reviewRepository.softDelete(reviewId);
  }
}
