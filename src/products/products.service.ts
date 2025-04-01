import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDTO } from './dto/createProduct.dto';
import { UpdateProductDTO } from './dto/updateProduct.dto';
import { PaginatedProduct, Product } from './entity/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoryType } from '../common/type/category.type';
import { SellProductType } from '../common/type/sellProduct.type';
import { SellersService } from '../sellers/sellers.service';
import { paginate } from '../pagination/paginator';
import { VerifyOCOPStatus } from '../common/type/verifyOCOP.type';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private sellerService: SellersService,
  ) {}

  async createProduct(storeId: string | undefined, product: CreateProductDTO) {
    const newProduct = this.productRepository.create(product);
    const seller = await this.sellerService.getSellerByStoreId(storeId);
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    newProduct.seller = seller;
    return this.productRepository.save(newProduct);
  }

  async updateProduct(id: string, product: UpdateProductDTO) {
    const existingProduct = await this.productRepository.findOne({
      where: { id },
    });
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }
    const updatedProduct = await this.productRepository.update(id, product);
    return updatedProduct;
  }

  async deleteProduct(id: string) {
    const result = await this.productRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Product not found');
    }
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async getProductsByIds(ids: string[]) {
    return this.productRepository.find({
      where: { id: In(ids) },
      relations: ['seller'],
    });
  }

  async getProductsBySellerId(
    id: string,
    {
      search,
      status,
      category,
      limit,
      page,
      verifyStatus,
    }: {
      search?: string;
      status?: SellProductType;
      category?: CategoryType;
      limit: number;
      page: number;
      verifyStatus?: VerifyOCOPStatus;
    },
  ) {
    const offset = page * limit;
    let qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller')
      .where('seller.id = :id', { id })
      .andWhere('product.deletedAt IS NULL')
      .orderBy('product.createdAt', 'DESC');
    if (search) {
      qb = qb.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }
    if (status) {
      qb = qb.andWhere('product.status = :status', { status });
    }
    if (category) {
      qb = qb.andWhere('product.category = :category', { category });
    }
    if (verifyStatus) {
      qb = qb.andWhere('product.verifyOcopStatus = :verifyStatus', {
        verifyStatus,
      });
    }
    return await paginate<Product, PaginatedProduct>(qb, PaginatedProduct, {
      limit,
      page,
      total: true,
    });
  }

  async getAllProducts() {
    return this.productRepository.find();
  }

  async getProductsByCategory(category: CategoryType) {
    return this.productRepository.find({ where: { category } });
  }

  async getProductsByStatus(status: SellProductType) {
    return this.productRepository.find({ where: { status } });
  }
}
