import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedUser, User } from './entity/user.entity';
import { Brackets, In, IsNull, Not, Repository } from 'typeorm';
import { UpdateProfileDTO } from './input/updateProfile.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDTO } from './input/updatePassword.dto';
import { Role } from '../common/type/role.type';
import { UpdateRoleDTO } from './input/updateRole.dto';
import { OrderStatusType } from '../common/type/orderStatus.type';
import { PaymentStatusType } from '../common/type/paymentStatus.type';
import { paginate } from '../pagination/paginator';
import { AddViewProductDto } from './input/addViewProduct.dto';
import { Product } from '../products/entity/product.entity';
import { CreateViewHistoryDTO } from './input/createViewHistory.dto';
import { UserViewHistory } from '../user-view-histories/entity/userViewHistory.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(UserViewHistory)
    private readonly userViewHistoryRepository: Repository<UserViewHistory>,
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
    return await this.userRepository.save(
      new User({
        ...user,
        isActive: !user.isActive,
      }),
    );
  }
  async deactiveUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.save(
      new User({
        ...user,
        isActive: !user.isActive,
      }),
    );
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
        status: [
          OrderStatusType.CANCELLED,
          OrderStatusType.REJECTED,
          OrderStatusType.REFUNDED,
        ],
      })
      .groupBy('user.id')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('AVG(review.rating)', 'averageRating')
      .addSelect('SUM(order.totalPrice - order.shippingFee)', 'totalOrder')
      .addSelect('MAX(order.createdAt)', 'lastOrder')
      .orderBy('totalOrder', 'DESC')
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

  async getUsers({
    limit = 15,
    page = 1,
    search,
    isActive,
  }: {
    limit: number;
    page: number;
    search?: string;
    isActive?: boolean;
  }) {
    const subQb = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.orders', 'order')
      .where('user.deletedAt IS NULL')
      .andWhere('order.orderStatus NOT IN (:...excludedStatuses)', {
        excludedStatuses: [
          OrderStatusType.CANCELLED,
          OrderStatusType.REJECTED,
          OrderStatusType.REFUNDED,
        ],
      })
      .select('user.id', 'userId')
      .addSelect('SUM(order.totalPrice - order.shippingFee)', 'totalOrderValue')
      .groupBy('user.id');

    let qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.seller', 'seller')
      .leftJoinAndSelect('user.reviews', 'review')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('user.orders', 'order')
      .leftJoinAndSelect('order.payment', 'payment')
      .leftJoin(
        '(' + subQb.getQuery() + ')',
        'orderTotal',
        'orderTotal.userId = user.id',
      )
      .addSelect('orderTotal.totalOrderValue', 'totalOrderValue')
      .where('user.deletedAt IS NULL')
      .andWhere('seller.deletedAt IS NULL')
      .orderBy('totalOrderValue', 'DESC')
      .setParameters(subQb.getParameters());

    if (search) {
      qb = qb.andWhere(
        new Brackets((qb) => {
          qb.where('user.name LIKE :search', { search: `%${search}%` })
            .orWhere('user.email LIKE :search', { search: `%${search}%` })
            .orWhere('user.phone LIKE :search', { search: `%${search}%` });
        }),
      );
    }
    if (isActive === false) {
      qb = qb.andWhere('user.isActive = :isActive', { isActive: false });
    }

    return await paginate<User, PaginatedUser>(qb, PaginatedUser, {
      limit,
      page,
      total: true,
    });
  }

  async getUser(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      relations: [
        'seller',
        'reviews',
        'reviews.product',
        'orders',
        'addresses',
      ],
    });
  }

  async getCustomerCountGroupByProvince(sellerId: string) {
    const listCustomer = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.orders', 'order')
      .leftJoin('order.payment', 'payment')
      .leftJoin('order.seller', 'seller')
      .leftJoin('order.orderDetails', 'orderDetails')
      .leftJoin('order.address', 'address')
      .leftJoinAndSelect('orderDetails.review', 'review')
      .where('seller.id = :sellerId', { sellerId })
      .select(['address.province', 'COUNT(user.id) as customerCount'])
      .groupBy('address.province')
      .orderBy('customerCount', 'DESC')
      .limit(5)
      .getRawMany();
    return listCustomer.map((row) => ({
      province: row.address_province,
      customerCount: parseInt(row.customerCount, 10),
    }));
  }

  async getCustomers(
    sellerId: string,
    {
      limit = 15,
      page = 1,
      search,
    }: {
      limit: number;
      page: number;
      search?: string;
    },
  ) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'order')
      .leftJoinAndSelect('order.payment', 'payment')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.orderDetails', 'orderDetails')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('user.reviews', 'review')
      .where('seller.id = :sellerId', { sellerId });

    if (search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('user.name LIKE :search', { search: `%${search}%` })
            .orWhere('user.email LIKE :search', { search: `%${search}%` })
            .orWhere('user.phone LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    return await paginate<User, PaginatedUser>(qb, PaginatedUser, {
      limit,
      page,
      total: true,
    });
  }

  async createViewHistory(
    createViewHistoryDTO: CreateViewHistoryDTO,
    userId: string,
  ) {
    const { productIds } = createViewHistoryDTO;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const products = await this.productRepository.findBy({
      id: In(productIds),
    });

    await this.userViewHistoryRepository.delete({
      userId,
      productId: In(productIds),
    });

    const existingHistories = await this.userViewHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    const merged = [
      ...existingHistories.map((h) => h.productId),
      ...productIds,
    ];

    let uniqueLimited = []
    const set = new Set()
     for(let i = merged.length - 1; i >= 0; i--) {
      if(!set.has(merged[i])) {
        set.add(merged[i])
        uniqueLimited.unshift(merged[i])
      }
     }
    uniqueLimited = uniqueLimited.slice(-10);

    await this.userViewHistoryRepository.delete({ userId });

    const newHistories = uniqueLimited.map((productId, index) =>
      this.userViewHistoryRepository.create({
        userId,
        productId,
      }),
    );

    await this.userViewHistoryRepository.save(newHistories);

    return { message: 'View history updated successfully' };
  }
}
