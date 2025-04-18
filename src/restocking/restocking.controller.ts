import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RestockingService } from './restocking.service';
import { CategoryType } from '../common/type/category.type';

@Controller('restocking')
export class RestockingController {
  constructor(private readonly restockingService: RestockingService) {}

  @Get()
  async getRestockings(
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('category') category?: CategoryType,
    @Query('productId') productId?: string,
  ) {
    return this.restockingService.getRestockings({
      limit,
      page,
      search,
      category,
      productId,
    });
  }
}
