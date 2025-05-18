import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedRestocking, Restocking } from './entity/restocking.entity';
import { User } from '../users/entity/user.entity';
import { Product } from '../products/entity/product.entity';
import { CategoryType } from '../common/type/category.type';
import { paginate } from '../pagination/paginator';
import { Seller } from '../sellers/entity/seller.entity';
@Injectable()
export class RestockingService {
  constructor(
    @InjectRepository(Restocking)
    private restockingRepository: Repository<Restocking>,
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createRestocking({
    storeId,
    productId,
    quantity,
  }: {
    storeId: string;
    productId: string;
    quantity: number;
  }) {
    const seller = await this.sellerRepository.findOne({
      where: { id: storeId },
    });
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    const restocking = new Restocking({
      seller,
      product,
      quantity,
    });
    return this.restockingRepository.save(restocking);
  }
  async getRestockings(
    sellerId: string,
    {
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
    },
  ) {
    let qb = this.restockingRepository
      .createQueryBuilder('restocking')
      .leftJoinAndSelect('restocking.seller', 'seller')
      .leftJoinAndSelect('restocking.product', 'product')
      .where('seller.id = :sellerId', { sellerId })
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
