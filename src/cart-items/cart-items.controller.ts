import {
  Controller,
  Param,
  Delete,
  UseGuards,
  Put,
  Body,
} from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { JwtAuthGuard } from '../auth/authGuard.jwt';
import { CurrentUser } from '../common/decorator/currentUser.decorator';
import { User } from '../users/entity/user.entity';
import { UpdateCartItemDto } from './dto/updateCartItem.dto';

@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCartItem(@Param('id') id: string, @CurrentUser() user: User) {
    return this.cartItemsService.deleteCartItem(id, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCartItem(
    @Param('id') id: string,
    @Body() body: UpdateCartItemDto,
    @CurrentUser() user: User,
  ) {
    return this.cartItemsService.updateCartItem(id, body, user);
  }
}
