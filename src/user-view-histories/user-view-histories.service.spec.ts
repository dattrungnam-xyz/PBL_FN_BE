import { Test, TestingModule } from '@nestjs/testing';
import { UserViewHistoriesService } from './user-view-histories.service';

describe('UserViewHistoriesService', () => {
  let service: UserViewHistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserViewHistoriesService],
    }).compile();

    service = module.get<UserViewHistoriesService>(UserViewHistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
