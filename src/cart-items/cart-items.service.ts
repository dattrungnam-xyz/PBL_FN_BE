import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItems } from './entity/cartItems.entity';
import { User } from '../users/entity/user.entity';
import { UpdateCartItemDto } from './dto/updateCartItem.dto';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItems)
    private cartItemsRepository: Repository<CartItems>,
  ) {}

  async deleteCartItem(id: string, user: User) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id, cart: { user: { id: user.id } } },
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartItemsRepository.softDelete(cartItem.id);
    return { message: 'Cart item deleted successfully' };
  }

  async updateCartItem(id: string, body: UpdateCartItemDto, user: User) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id, cart: { user: { id: user.id } } },
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    cartItem.quantity = body.quantity;
    return this.cartItemsRepository.save(cartItem);
  }

  async deleteCartItemByUserIdAndProductId(userId: string, productId: string) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { cart: { user: { id: userId } }, product: { id: productId } },
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartItemsRepository.delete(cartItem.id);
  }
}
