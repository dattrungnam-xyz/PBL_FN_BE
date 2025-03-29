import { Injectable, NotFoundException } from '@nestjs/common';
import { Seller } from './entity/seller.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSellerDTO } from './dto/createSeller.dto';
import { UpdateSellerDTO } from './dto/updateSeller.dto';
import { User } from '../users/entity/user.entity';

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
    return this.sellerRepository.findOne({ where: { id } });
  }

  getSellers() {
    return this.sellerRepository.find();
  }

  getSellerByStoreId(storeId: string) {
    return this.sellerRepository.findOne({ where: { id: storeId } });
  }
}
