import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restocking } from './entity/restocking.entity';
import { User } from '../users/entity/user.entity';
import { Product } from '../products/entity/product.entity';
@Injectable()
export class RestockingService {
  constructor(
    @InjectRepository(Restocking)
    private restockingRepository: Repository<Restocking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createRestocking({
    userId,
    productId,
    quantity,
  }: {
    userId: string;
    productId: string;
    quantity: number;
  }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    const restocking = new Restocking({
      user,
      product,
      quantity,
    });
    return this.restockingRepository.save(restocking);
  }
}
