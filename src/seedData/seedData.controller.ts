import { Body, Controller, Post } from '@nestjs/common';
import { SeedUserStoreProductDto } from './dto/seedUserStoreProduct.dto';
import { SeedDataService } from './seedData.service';

@Controller('seed-data')
export class SeedDataController {
  constructor(private readonly seedDataService: SeedDataService) {}

  @Post()
  seedUserStoreProduct(
    @Body() seedUserStoreProductDto: SeedUserStoreProductDto,
  ) {
    return this.seedDataService.seedUserStoreProduct(seedUserStoreProductDto);
  }
}
