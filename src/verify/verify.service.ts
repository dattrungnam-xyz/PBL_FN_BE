import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verify } from './entity/verify.entity';
import { CreateVerifyDTO } from './dto/createVerify.dto';
import { ProductsService } from '../products/products.service';
import { VerifyDTO } from './dto/verify.dto';
import { VerifyOCOPStatus } from '../common/type/verifyOCOP.type';
import { UpdateVerifyDTO } from './dto/updateVerify.dto';
import { PaginatedVerify } from './entity/verify.entity';
import { paginate } from '../pagination/paginator';
@Injectable()
export class VerifyService {
  constructor(
    @InjectRepository(Verify)
    private verifyRepository: Repository<Verify>,
    private productService: ProductsService,
  ) {}

  async createVerify(storeId: string, createVerifyDto: CreateVerifyDTO) {
    const verify = this.verifyRepository.create(createVerifyDto);
    const products = await this.productService.getProductsByIds(
      createVerifyDto.productIds,
    );
    if (products.some((product) => product.seller.id !== storeId)) {
      throw new BadRequestException(
        'You are not authorized to verify this product',
      );
    }
    verify.products = products;
    return this.verifyRepository.save(verify);
  }

  async verify(id: string, verifyDto: VerifyDTO) {
    const verify = await this.verifyRepository.findOne({
      where: { id },
    });
    if (!verify) {
      throw new NotFoundException('Verify not found');
    }
    verify.status = verifyDto.status;

    return this.verifyRepository.save(verify);
  }

  async updateVerify(id: string, updateVerifyDto: UpdateVerifyDTO) {
    const verify = await this.verifyRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!verify) {
      throw new NotFoundException(`Verify record with ID ${id} not found`);
    }

    if (verify.status !== VerifyOCOPStatus.PENDING) {
      throw new BadRequestException(
        `Cannot update verify record. Current status: ${verify.status}`,
      );
    }

    try {
      const products = await this.productService.getProductsByIds(
        updateVerifyDto.productIds,
      );

      if (!products || products.length === 0) {
        throw new BadRequestException(
          'No valid products found with the provided IDs',
        );
      }

      Object.assign(verify, {
        products,
        star: updateVerifyDto.star,
        manufacturer: updateVerifyDto.manufacturer,
        verifyDate: updateVerifyDto.verifyDate,
        images: updateVerifyDto.images,
        productName: updateVerifyDto.productName,
        updatedAt: new Date(),
      });

      const updatedVerify = await this.verifyRepository.save(verify);
      return updatedVerify;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update verify record',
        error.message,
      );
    }
  }

  async deleteVerify(id: string, storeId: string) {
    const verify = await this.verifyRepository.findOne({
      where: { id },
      relations: ['products', 'products.seller'],
    });
    if (!verify) {
      throw new NotFoundException('Verify not found');
    }
    if (verify.products.some((product) => product.seller.id !== storeId)) {
      throw new BadRequestException(
        'You are not authorized to delete this verify',
      );
    }
    return this.verifyRepository.softDelete(id);
  }

  async getVerifyById(id: string) {
    const verify = await this.verifyRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    return verify;
  }

  async getVerifyByStoreId(
    storeId: string,
    {
      limit,
      page,
      status,
      search,
    }: {
      limit: number;
      page: number;
      status?: VerifyOCOPStatus;
      search?: string;
    },
  ) {
    const qb = this.verifyRepository.createQueryBuilder('verify');
    qb.leftJoinAndSelect('verify.products', 'products');
    qb.leftJoinAndSelect('products.seller', 'seller');
    qb.where('seller.id = :storeId', { storeId });
    if (status) {
      qb.andWhere('verify.status = :status', { status });
    }
    if (search) {
      qb.andWhere('verify.productName LIKE :search', { search: `%${search}%` });
    }
    return await paginate<Verify, PaginatedVerify>(qb, PaginatedVerify, {
      limit,
      page,
      total: true,
    });
  }

  async getVerify({
    limit,
    page,
    status,
    search,
    storeId,
  }: {
    limit: number;
    page: number;
    status?: VerifyOCOPStatus;
    search?: string;
    storeId?: string;
  }) {
    const qb = this.verifyRepository.createQueryBuilder('verify');
    qb.leftJoinAndSelect('verify.products', 'products');
    qb.leftJoinAndSelect('products.seller', 'seller');
    if (storeId) {
      qb.where('seller.id = :storeId', { storeId });
    }
    if (status) {
      qb.andWhere('verify.status = :status', { status });
    }
    if (search) {
      qb.andWhere('verify.productName LIKE :search', { search: `%${search}%` });
    }
    qb.orderBy('verify.createdAt', 'DESC');
    return await paginate<Verify, PaginatedVerify>(qb, PaginatedVerify, {
      limit,
      page,
      total: true,
    });
  }

  async getAllVerify({
    limit,
    page,
    status,
    search,
  }: {
    limit: number;
    page: number;
    status?: VerifyOCOPStatus;
    search?: string;
  }) {
    const qb = this.verifyRepository.createQueryBuilder('verify');
    if (status) {
      qb.andWhere('verify.status = :status', { status });
    }
    return await paginate<Verify, PaginatedVerify>(qb, PaginatedVerify, {
      limit,
      page,
      total: true,
    });
  }

  async approveVerify(id: string) {
    const verify = await this.verifyRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    verify.status = VerifyOCOPStatus.VERIFIED;
    verify.rejectReason = '';
    verify.products.forEach((product) => {
      this.productService.handleVerifyProduct(product.id)
    });

    return this.verifyRepository.save(verify);
  }

  async rejectVerify(id: string, reason: string) {
    const verify = await this.verifyRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    verify.status = VerifyOCOPStatus.REJECTED;
    verify.rejectReason = reason;
    verify.products.forEach((product) => {
      this.productService.handleRejectVerifyProduct(product.id, verify.id)
    });
    return this.verifyRepository.save(verify);
  }
}
