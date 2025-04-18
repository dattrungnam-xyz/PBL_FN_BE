import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedRestocking, Restocking } from './entity/restocking.entity';
import { User } from '../users/entity/user.entity';
import { Product } from '../products/entity/product.entity';
import { CategoryType } from '../common/type/category.type';
import { paginate } from '../pagination/paginator';
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
  async getRestockings({
    limit,
    page,
    search,
    category,
    productId,
  }: {
    limit: number;
    page: number;
    search: string;
    category: CategoryType;
    productId: string;
  }) {
    let qb = this.restockingRepository
      .createQueryBuilder('restocking')
      .leftJoinAndSelect('restocking.user', 'user')
      .leftJoinAndSelect('restocking.product', 'product')
      .where('user.deletedAt IS NULL')
      .andWhere('product.deletedAt IS NULL')
      .orderBy('restocking.createdAt', 'DESC');
    if (productId) {
      qb = qb.andWhere('product.id = :productId', { productId });
    }
    if (search) {
      qb = qb.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }
    if (category) {
      qb = qb.andWhere('product.category = :category', { category });
    }

    return await paginate<Restocking, PaginatedRestocking>(
      qb,
      PaginatedRestocking,
      {
        limit,
        page,
        total: true,
      },
    );
  }
}
