import {
  Controller,
  Post,
  Body,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateUpdateCartDTO } from './dto/createUpdateCart.dto';

import { User } from 'src/users/entity/user.entity';
import { JwtAuthGuard } from '../auth/authGuard.jwt';
import { CurrentUser } from '../common/decorator/currentUser.decorator';

@Controller('carts')
@UseInterceptors(ClassSerializerInterceptor)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrUpdateCart(
    @Body() createUpdateCartDto: CreateUpdateCartDTO,
    @CurrentUser() user: User,
  ) {
    return this.cartsService.createOrUpdateCart(user.id, createUpdateCartDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@CurrentUser() user: User) {
    return this.cartsService.getCartGroupBySeller(user.id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async getCartCheckOut(
    @CurrentUser() user: User,
    @Body() body: { selectedItems: (string | number)[] },
  ) {
    return this.cartsService.getCartCheckOut(user.id, body.selectedItems);
  }
}
