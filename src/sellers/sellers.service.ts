import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedSeller, Seller } from './entity/seller.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateSellerDTO } from './dto/createSeller.dto';
import { UpdateSellerDTO } from './dto/updateSeller.dto';
import { User } from '../users/entity/user.entity';
import { paginate } from '../pagination/paginator';
import { OrderStatusType } from '../common/type/orderStatus.type';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
  ) {}
  async create(createSellerDto: CreateSellerDTO, user: User) {
    const seller = this.sellerRepository.create({
      ...createSellerDto,
      user: user,
    });
    return this.sellerRepository.save(seller);
  }

  async update(id: string, updateSellerDto: UpdateSellerDTO) {
    const seller = await this.sellerRepository.findOne({ where: { id } });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    return this.sellerRepository.save({ ...seller, ...updateSellerDto });
  }

  getSellerByUserId(userId: string) {
    return this.sellerRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  getSellerById(id: string) {
    return this.sellerRepository.findOne({
      where: { id },
      relations: [
        'user',
        'products',
        'orders',
        'orders.orderDetails',
        'orders.orderDetails.review',
        'orders.user',
      ],
    });
  }

  async getSellers({
    limit,
    page,
    search,
    province,
    district,
    ward,
  }: {
    limit: number;
    page: number;
    search?: string;
    province?: string;
    district?: string;
    ward?: string;
  }) {
    let qb = this.sellerRepository
      .createQueryBuilder('seller')
      .leftJoinAndSelect('seller.user', 'user')
      .leftJoinAndSelect('seller.products', 'products')
      .leftJoinAndSelect('seller.orders', 'orders')
      .leftJoinAndSelect('orders.orderDetails', 'orderDetails')
      .leftJoinAndSelect('orderDetails.review', 'review')
      .where('seller.deletedAt IS NULL')
      .orderBy('seller.createdAt', 'DESC');
    if (search) {
      qb = qb.andWhere('seller.name LIKE :search', { search: `%${search}%` });
    }
    if (province) {
      qb = qb.andWhere('seller.province = :province', { province });
    }
    if (district) {
      qb = qb.andWhere('seller.district = :district', { district });
    }
    if (ward) {
      qb = qb.andWhere('seller.ward = :ward', { ward });
    }

    return await paginate<Seller, PaginatedSeller>(qb, PaginatedSeller, {
      limit,
      page,
      total: true,
    });
  }

  getSellerByStoreId(storeId: string) {
    return this.sellerRepository.findOne({ where: { id: storeId } });
  }
}
