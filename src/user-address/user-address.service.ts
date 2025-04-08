import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress } from './entity/userAddress.entity';
import { UpdateUserAddressDTO } from './dto/updateUserAddress.dto';
import { CreateUserAddressDTO } from './dto/createUserAddress.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
    private readonly userService: UsersService,
  ) {}

  async getUserAddresses(userId: string) {
    return this.userAddressRepository.find({ where: { user: { id: userId } } });
  }

  async createUserAddress(userId: string, body: CreateUserAddressDTO) {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userAddress = this.userAddressRepository.create({
      ...body,
      user: user,
    });
    return this.userAddressRepository.save(userAddress);
  }

  async updateUserAddress(
    userId: string,
    id: string,
    body: UpdateUserAddressDTO,
  ) {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!userAddress) {
      throw new NotFoundException('User address not found');
    }
    return this.userAddressRepository.save(
      new UserAddress({ ...userAddress, ...body }),
    );
  }

  async deleteUserAddress(userId: string, id: string) {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!userAddress) {
      throw new NotFoundException('User address not found');
    }
    return this.userAddressRepository.softDelete(userAddress.id);
  }

  async getUserAddress(userId: string, id: string) {
    return this.userAddressRepository.findOne({
      where: { id, user: { id: userId } },
    });
  }
  async findOneById(id: string) {
    return this.userAddressRepository.findOne({ where: { id } });
  }
}
