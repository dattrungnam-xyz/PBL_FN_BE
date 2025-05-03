import { Test, TestingModule } from '@nestjs/testing';
import { UserViewHistoriesController } from './user-view-histories.controller';
import { UserViewHistoriesService } from './user-view-histories.service';

describe('UserViewHistoriesController', () => {
  let controller: UserViewHistoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserViewHistoriesController],
      providers: [UserViewHistoriesService],
    }).compile();

    controller = module.get<UserViewHistoriesController>(UserViewHistoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
