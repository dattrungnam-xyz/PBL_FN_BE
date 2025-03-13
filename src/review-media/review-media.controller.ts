import { Controller } from '@nestjs/common';
import { ReviewMediaService } from './review-media.service';

@Controller('review-media')
export class ReviewMediaController {
  constructor(private readonly reviewMediaService: ReviewMediaService) {}
}
