import { Test, TestingModule } from '@nestjs/testing';
import { RestockingController } from './restocking.controller';
import { RestockingService } from './restocking.service';

describe('RestockingController', () => {
  let controller: RestockingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestockingController],
      providers: [RestockingService],
    }).compile();

    controller = module.get<RestockingController>(RestockingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
