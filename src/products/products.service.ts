import {
  BadRequestException,
  ForbiddenException,
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
import { getDateCycle } from '../utils/generateDateCycle';
import { RestockingService } from '../restocking/restocking.service';
import { OrderStatusType } from '../common/type/orderStatus.type';
import { RedisPubService } from '../redis/redis.service';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private sellerService: SellersService,
    private restockingService: RestockingService,
    private readonly redisService: RedisPubService,
  ) {}

  async createProduct(storeId: string | undefined, product: CreateProductDTO) {
    const newProduct = this.productRepository.create(product);
    const seller = await this.sellerService.getSellerByStoreId(storeId);
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    newProduct.seller = seller;

    const pr = await this.productRepository.save(newProduct);

    const cacheProduct = {
      id: pr.id,
      name: pr.name,
      category: pr.category,
      description: pr.description,
      province: seller.province,
      price: pr.price,
      star: pr.star,
      status: pr.status,
    };
    const payload = {
      data: cacheProduct,
      event:"create"
    }
    await this.redisService.publish('product-events', cacheProduct);
    return pr;
  }

  async updateProduct(id: string, product: UpdateProductDTO) {
    const existingProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.update(id, product);

    const updatedProduct = await this.productRepository.findOne({ where: { id }, relations: ['seller'] });

    const cacheProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      category: updatedProduct.category,
      description: updatedProduct.description,
      province: updatedProduct?.seller?.province,
      price: updatedProduct.price,
      star: updatedProduct.star,
      status: updatedProduct.status,
    }
    const payload = {
      data: cacheProduct,
      event:"update"
    }
    await this.redisService.publish('product-events', payload);
    return updatedProduct;
  }

  async deleteProduct(id: string, userId: string) {
    const product = await this.productRepository.findOne({
      where: {
        seller: {
          user: {
            id: userId,
          },
        },
        id,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const payload = {
      id: id,
      event:"delete"
    }
    await this.redisService.publish("product-events", payload)
    const result = await this.productRepository.softDelete(id);
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'seller',
        'reviews',
        'reviews.user',
        'reviews.orderDetail',
        'reviews.orderDetail.product',
        'orderDetails',
        'verify',
      ],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.redisService.publish('product.deleted', { id: id });
    return product;
  }

  async getProductsByIds(ids: string[]) {
    return this.productRepository.find({
      where: { id: In(ids) },
      relations: ['seller'],
    });
  }

  async getProductsBySellerId(
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
    id?: string,
  ) {
    const offset = page * limit;
    let qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller')
      .where('seller.deletedAt IS NULL')
      .andWhere('product.deletedAt IS NULL')
      .orderBy('product.createdAt', 'DESC');
    if (id) {
      qb = qb.andWhere('seller.id = :id', { id });
    }
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

  async updateProductQuantity(id: string, quantity: number) {
    const product = await this.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.quantity = quantity;
    return this.productRepository.save(product);
  }

  async getTopSellReviews(sellerId: string, type: 'year' | 'month' | 'week') {
    const { startDate, startDatePreviousCycle } = getDateCycle(type);
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.seller', 'seller')
      .leftJoin('product.reviews', 'review', 'review.createdAt >= :startDate', {
        startDate,
      })
      .leftJoin(
        'review.orderDetail',
        'orderDetail',
        'orderDetail.createdAt >= :startDate',
        {
          startDate,
        },
      )
      .where('seller.id = :sellerId', { sellerId })
      .groupBy('product.id')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .addSelect('COUNT(orderDetail.id)', 'orderDetailCount')
      .orderBy('avgRating', 'DESC')
      .getRawAndEntities();

    return products.entities
      .map((product, index) => ({
        ...product,
        avgRating: parseFloat(products.raw[index].avgRating),
        reviewCount: parseInt(products.raw[index].reviewCount, 10),
        orderDetailCount: parseInt(products.raw[index].orderDetailCount, 10),
      }))
      .slice(0, 5);
  }

  async getTopSellTrending(sellerId: string, type: 'year' | 'month' | 'week') {
    const { startDate, startDatePreviousCycle } = getDateCycle(type);
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.seller', 'seller')
      .leftJoin(
        'product.orderDetails',
        'orderDetail',
        'orderDetail.createdAt >= :startDate',
        { startDate },
      )
      .leftJoin(
        'orderDetail.order',
        'order',
        'order.orderStatus NOT IN (:...excludedStatuses)',
        {
          excludedStatuses: [
            OrderStatusType.CANCELLED,
            OrderStatusType.REJECTED,
            OrderStatusType.REFUNDED,
          ],
        },
      )
      .where('seller.id = :sellerId', { sellerId })
      .groupBy('product.id')
      .addSelect('COUNT(orderDetail.id)', 'orderDetailCount')
      .addSelect(
        'SUM(orderDetail.quantity * orderDetail.price)',
        'totalRevenue',
      )
      .orderBy('orderDetailCount', 'DESC')
      .getRawAndEntities();

    return products.entities
      .map((product, index) => ({
        ...product,
        orderDetailCount: parseInt(products.raw[index].orderDetailCount, 10),
        totalRevenue: parseFloat(products.raw[index].totalRevenue),
      }))
      .slice(0, 5);
  }

  async addProductQuantity(id: string, quantity: number, userId: string) {
    const product = await this.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.quantity += quantity;
    this.restockingService.createRestocking({
      userId,
      productId: product.id,
      quantity,
    });
    return this.productRepository.save(product);
  }

  async handleVerifyProduct(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['verify'],
    });
    product.verifyOcopStatus = VerifyOCOPStatus.VERIFIED;
    return this.productRepository.save(product);
  }

  async handleRejectVerifyProduct(id: string, verifyId: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['verify'],
    });
    if (
      product.verify.some(
        (verify) =>
          verify.id !== verifyId && verify.status === VerifyOCOPStatus.VERIFIED,
      )
    ) {
      product.verifyOcopStatus = VerifyOCOPStatus.VERIFIED;
    } else {
      product.verifyOcopStatus = VerifyOCOPStatus.REJECTED;
    }
    return this.productRepository.save(product);
  }

  async getCountCategory(sellerId?: string) {
    const listCatefogry = [
      CategoryType.FOOD,
      CategoryType.BEVERAGE,
      CategoryType.HANDICRAFTS_DECORATION,
      CategoryType.HERB,
    ];
    const allPromise = listCatefogry.map((category) =>
      this.productRepository.count({
        where: { category, seller: sellerId ? { id: sellerId } : undefined },
      }),
    );
    const count = await Promise.all(allPromise);
    return count.map((c, index) => ({
      category: listCatefogry[index],
      count: c,
    }));
  }
}
