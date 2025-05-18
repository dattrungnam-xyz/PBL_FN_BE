import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RestockingService } from './restocking.service';
import { CategoryType } from '../common/type/category.type';
import { JwtAuthGuard } from '../auth/authGuard.jwt';
import { CurrentUser } from '../common/decorator/currentUser.decorator';
import { User } from '../users/entity/user.entity';

@Controller('restocking')
export class RestockingController {
  constructor(private readonly restockingService: RestockingService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getRestockings(
    @CurrentUser() user: User,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('category') category?: CategoryType,
    @Query('productId') productId?: string,
  ) {
    return this.restockingService.getRestockings(user.storeId, {
      limit,
      page,
      search,
      category,
      productId,
    });
  }
}
