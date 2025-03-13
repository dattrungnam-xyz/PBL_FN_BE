import { Test, TestingModule } from '@nestjs/testing';
import { ReviewMediaController } from './review-media.controller';
import { ReviewMediaService } from './review-media.service';

describe('ReviewMediaController', () => {
  let controller: ReviewMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewMediaController],
      providers: [ReviewMediaService],
    }).compile();

    controller = module.get<ReviewMediaController>(ReviewMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
