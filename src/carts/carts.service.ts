import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cart } from './entity/cart.entity';
import { UsersService } from '../users/users.service';
import { CreateUpdateCartDTO } from './dto/createUpdateCart.dto';
import { ProductsService } from '../products/products.service';
import { CartItems } from '../cart-items/entity/cartItems.entity';
import { Seller } from '../sellers/entity/seller.entity';
@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItems)
    private readonly cartItemRepository: Repository<CartItems>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private readonly userService: UsersService,
    private readonly productService: ProductsService,
  ) {}

  async createCart(userId: string) {
    const cart = new Cart();
    const user = await this.userService.findOneById(userId);
    cart.user = user;
    return this.cartRepository.save(cart);
  }

  async createOrUpdateCart(
    userId: string,
    createUpdateCartDto: CreateUpdateCartDTO,
  ) {
    let existingCart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.product'],
    });

    if (!existingCart) {
      existingCart = await this.createCart(userId);
      const user = await this.userService.findOneById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      existingCart.user = user;
    }

    const { productId, quantity } = createUpdateCartDto;
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const cartItem = existingCart.items?.find(
      (item) => item.product.id === productId,
    );

    if (cartItem) {
      cartItem.quantity = (cartItem.quantity || 0) + quantity;
    } else {
      const newCartItem = new CartItems();
      newCartItem.product = product;
      newCartItem.quantity = quantity;
      existingCart.items.push(newCartItem);
    }

    return this.cartRepository.save(existingCart);
  }

  async getCartGroupBySeller(userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'items',
        'items.product',
        'items.product.seller',
        'items.product.verify',
      ],
    });
    if (!cart) {
      return [];
    }
    const cartGroupBySeller = cart.items.reduce((acc, item) => {
      const sellerId = item.product.seller.id;
      if (!acc[sellerId]) {
        acc[sellerId] = {
          seller: item.product.seller,
          items: [],
        };
      }
      acc[sellerId].items.push(item);
      return acc;
    }, {});
    return Object.values(cartGroupBySeller);
  }
  async getCartCheckOut(userId: string, selectedItems: (string | number)[]) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId }, items: { id: In(selectedItems) } },
      relations: [
        'items',
        'items.product',
        'items.product.seller',
        'items.product.verify',
      ],
    });
    if (!cart) {
      return [];
    }
    const cartGroupBySeller = cart.items.reduce((acc, item) => {
      const sellerId = item.product.seller.id;
      if (!acc[sellerId]) {
        acc[sellerId] = {
          seller: item.product.seller,
          items: [],
        };
      }
      acc[sellerId].items.push(item);
      return acc;
    }, {});
    return Object.values(cartGroupBySeller);
  }
}
