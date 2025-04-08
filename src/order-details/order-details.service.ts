import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetail } from './entity/orderDetail.entity';
import { CreateOrderDetailDTO } from './dto/createOrderDetail.dto';
import { ProductsService } from '../products/products.service';
import { CartItemsService } from '../cart-items/cart-items.service';
@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    private readonly productService: ProductsService,
    private readonly cartItemService: CartItemsService,
  ) {}

  async createOrderDetail(
    userId: string,
    createOrderDetailDTO: CreateOrderDetailDTO,
  ) {
    const orderDetail = new OrderDetail();
    orderDetail.product = await this.productService.getProductById(
      createOrderDetailDTO.productId,
    );
    orderDetail.quantity = createOrderDetailDTO.quantity;
    orderDetail.price = orderDetail.product.price;
    await this.cartItemService.deleteCartItemByUserIdAndProductId(
      userId,
      createOrderDetailDTO.productId,
    );

    return this.orderDetailRepository.save(orderDetail);
  }
}
