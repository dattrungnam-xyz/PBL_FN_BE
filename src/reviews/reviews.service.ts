import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThan, Repository } from 'typeorm';
import { Review } from './entity/review.entity';
import { CreateReviewDTO } from './dto/createReview.dto';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { UpdateReviewDTO } from './dto/updateReview.dto';
import { OrderDetailsService } from '../order-details/order-details.service';
import { getDateCycle } from '../utils/generateDateCycle';
@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private orderDetailService: OrderDetailsService,
    private userService: UsersService,
  ) {}

  async createReview(userId: string, createReviewDto: CreateReviewDTO) {
    const orderDetail = await this.orderDetailService.getOrderDetailById(
      createReviewDto.orderDetailId,
    );
    if (!orderDetail) {
      throw new NotFoundException('Order detail not found');
    }
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const review = this.reviewRepository.create({
      ...createReviewDto,
      user,
      orderDetail,
      product: orderDetail.product,
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
    return this.reviewRepository.delete(reviewId);
  }

  async deleteReviewByOrderId(orderId: string) {
    const reviews = await this.reviewRepository.find({
      where: { orderDetail: { order: { id: orderId } } },
    });
    if (!reviews) {
      throw new NotFoundException('Review not found');
    }
    return this.reviewRepository.softDelete(reviews.map((review) => review.id));
  }

  async getReviewByProductId(productId: string) {
    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user', 'orderDetail', 'product'],
    });
    return reviews;
  }

  async getReviewCountByType(
    sellerId: string,
    type: 'year' | 'month' | 'week',
  ) {
    const { startDate, startDatePreviousCycle } = getDateCycle(type);
    const currentCycleReviews = await this.reviewRepository.find({
      where: {
        product: { seller: { id: sellerId } },
        createdAt: MoreThan(startDate),
      },
    });
    const previousCycleReviews = await this.reviewRepository.find({
      where: {
        product: { seller: { id: sellerId } },
        createdAt: Between(startDatePreviousCycle, startDate),
      },
    });
    const currentCycleReviewStar =
      currentCycleReviews.reduce((acc, review) => acc + review.rating, 0) /
      currentCycleReviews.length;
    const previousCycleReviewStar =
      previousCycleReviews.reduce((acc, review) => acc + review.rating, 0) /
      previousCycleReviews.length;
    return {
      currentCycle: currentCycleReviewStar || 0,
      previousCycle: previousCycleReviewStar || 0,
      percentage: previousCycleReviewStar
        ? Math.round((currentCycleReviewStar / previousCycleReviewStar) * 100)
        : currentCycleReviewStar
        ? 100
        : 0,
    };
  }
}
