import { Test, TestingModule } from '@nestjs/testing';
import { RestockingService } from './restocking.service';

describe('RestockingService', () => {
  let service: RestockingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestockingService],
    }).compile();

    service = module.get<RestockingService>(RestockingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
