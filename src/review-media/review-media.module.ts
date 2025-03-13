import { Module } from '@nestjs/common';
import { ReviewMediaService } from './review-media.service';
import { ReviewMediaController } from './review-media.controller';

@Module({
  controllers: [ReviewMediaController],
  providers: [ReviewMediaService],
})
export class ReviewMediaModule {}
