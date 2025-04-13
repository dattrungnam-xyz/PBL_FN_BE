import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { In, IsNull, Not, Repository } from 'typeorm';
import { UpdateProfileDTO } from './input/updateProfile.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDTO } from './input/updatePassword.dto';
import { Role } from '../common/type/role.type';
import { UpdateRoleDTO } from './input/updateRole.dto';
import { OrderStatusType } from '../common/type/orderStatus.type';
import { PaymentStatusType } from '../common/type/paymentStatus.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async updateProfile(user: User, updateProfileDTO: UpdateProfileDTO) {
    if (!user) {
      throw new UnauthorizedException();
    }
    if (updateProfileDTO.avatarUrl) {
      updateProfileDTO.avatar = updateProfileDTO.avatarUrl;
    } else if (updateProfileDTO.avatar) {
      updateProfileDTO.avatar = (
        await this.cloudinaryService.uploadImageBase64(updateProfileDTO.avatar)
      ).url;
    }
    for (let key of Object.keys(updateProfileDTO)) {
      user[key] = updateProfileDTO[key];
    }
    return await this.userRepository.save(user);
  }
  async updateUserInfor(id: string, updateProfileDTO: UpdateProfileDTO) {
    const user = await this.userRepository.findOneBy({ id });
    return await this.updateProfile(user, updateProfileDTO);
  }
  async findOneById(id: string) {
    return await this.userRepository.findOneBy({ id });
  }
  async getListUser() {
    return await this.userRepository.find();
  }
  async activeUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = true;
    return await this.userRepository.save(user);
  }
  async deactiveUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = false;
    return await this.userRepository.save(user);
  }
  async deleteUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.softDelete(id);
  }

  async getListUserWithDelete() {
    return await this.userRepository.find({ withDeleted: true });
  }
  async getListUserDelete() {
    return await this.userRepository.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
    });
  }
  async getListUserActive() {
    return await this.userRepository.find({ where: { isActive: true } });
  }
  async getListUserDeactive() {
    return await this.userRepository.find({ where: { isActive: false } });
  }
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
  async updateUserPassword(id: string, updatePasswordDTO: UpdatePasswordDTO) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.password = await this.hashPassword(updatePasswordDTO.password);
    return await this.userRepository.save(user);
  }
  async updateRole(id: string, updateRoleDTO: UpdateRoleDTO) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.roles = updateRoleDTO.roles;
    return await this.userRepository.save(user);
  }
  async getTopCustomers(sellerId: string) {
    const listCustomer = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.orders', 'order')
      .leftJoin('order.payment', 'payment')
      .leftJoin('order.seller', 'seller')
      .leftJoin('order.orderDetails', 'orderDetails')
      .leftJoin('orderDetails.review', 'review')
      .where('seller.id = :sellerId', { sellerId })
      .andWhere('payment.paymentStatus = :paid', {
        paid: PaymentStatusType.PAID,
      })
      .andWhere('order.orderStatus NOT IN (:...status)', {
        status: [OrderStatusType.CANCELLED, OrderStatusType.REJECTED],
      })
      .groupBy('user.id')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('AVG(review.rating)', 'averageRating')
      .addSelect('SUM(order.totalPrice - order.shippingFee)', 'totalOrder')
      .addSelect('MAX(order.createdAt)', 'lastOrder')
      .orderBy('orderCount', 'DESC')
      .limit(5)
      .getRawAndEntities();
    return listCustomer.raw.map((rawRow, index) => {
      const customer = listCustomer.entities[index];
      return {
        id: customer.id,
        name: customer.name,
        avatar: customer.avatar,
        email: customer.email,
        phone: customer.phone,
        orderCount: parseInt(rawRow.orderCount, 10),
        averageRating: rawRow.averageRating
          ? parseFloat(rawRow.averageRating).toFixed(2)
          : null,
        totalSpent: rawRow.totalOrder
          ? parseFloat(rawRow.totalOrder).toFixed(2)
          : 0,
        lastOrder: rawRow.lastOrder ? new Date(rawRow.lastOrder) : null,
      };
    });
  }
}
