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

  async getSellerByUserId(userId: string) {
    const seller = await this.sellerRepository.findOne({
      where: { user: { id: userId } },
    });
    return seller;
  }

  async getSellerById(id: string) {
    const seller = await this.sellerRepository.findOne({ where: { id } });
    return seller;
  }

  async getSellers() {
    return this.sellerRepository.find();
  }
}
