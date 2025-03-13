import { Test, TestingModule } from '@nestjs/testing';
import { ReviewMediaService } from './review-media.service';

describe('ReviewMediaService', () => {
  let service: ReviewMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewMediaService],
    }).compile();

    service = module.get<ReviewMediaService>(ReviewMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
