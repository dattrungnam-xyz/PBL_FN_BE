import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDTO } from './createReview.dto';

export class UpdateReviewDTO extends PartialType(CreateReviewDTO) {}
