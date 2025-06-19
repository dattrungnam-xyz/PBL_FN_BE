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
import { User } from '../users/entity/user.entity';
import axios from 'axios';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
      event: 'create',
    };
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

    const updatedProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['seller'],
    });

    const cacheProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      category: updatedProduct.category,
      description: updatedProduct.description,
      province: updatedProduct?.seller?.province,
      price: updatedProduct.price,
      star: updatedProduct.star,
      status: updatedProduct.status,
    };
    const payload = {
      data: cacheProduct,
      event: 'update',
    };
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
      event: 'delete',
    };
    await this.redisService.publish('product-events', payload);
    return await this.productRepository.softDelete(id);
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
      .leftJoinAndSelect('product.orderDetails', 'orderDetail')
      .leftJoinAndSelect('product.reviews', 'review')
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

  async getAllProducts({
    search,
    categories,
    limit,
    page,
    minPrice,
    maxPrice,
    provinces,
    userId,
    searchHistory,
    viewHistory,
  }: {
    search?: string;
    categories?: CategoryType[];
    limit: number;
    page: number;
    minPrice?: string;
    maxPrice?: string;
    provinces?: string[];
    userId?: string;
    searchHistory?: string[];
    viewHistory?: string[];
  }) {
    console.log(
      'call getAllProducts',
      viewHistory,
      searchHistory,
      search,
      userId,
    );
    if (!userId && !searchHistory && !viewHistory && !search) {
      return this.getPopularProducts({
        search,
        categories,
        limit,
        page,
        minPrice,
        maxPrice,
        provinces,
      });
    }
    const user = userId
      ? await this.userRepository.findOne({
          where: {
            id: userId,
          },
          relations: [
            'searchHistories',
            'userViewHistories',
            'userViewHistories.product',
          ],
        })
      : null;
    if (
      !user?.userViewHistories?.length &&
      !user?.searchHistories?.length &&
      !search &&
      !viewHistory &&
      !searchHistory
    ) {
      return this.getPopularProducts({
        search,
        categories,
        limit,
        page,
        minPrice,
        maxPrice,
        provinces,
      });
    }
    if (user) {
      return this.getRecommendProducts({
        search,
        categories,
        limit,
        page,
        provinces,
        searchHistory: [
          ...new Set(user?.searchHistories?.map((item) => item.search)),
        ],
        viewHistory: [
          ...new Set(user?.userViewHistories?.map((item) => item.product.id)),
        ],
        minPrice,
        maxPrice,
      });
    }
    return this.getRecommendProducts({
      search,
      categories,
      limit,
      page,
      provinces,
      searchHistory,
      viewHistory,
      minPrice,
      maxPrice,
    });
  }

  async getPopularProducts({
    search,
    categories,
    limit,
    page,
    minPrice,
    maxPrice,
    provinces,
  }: {
    search?: string;
    categories?: CategoryType[];
    limit: number;
    page: number;
    minPrice?: string;
    maxPrice?: string;
    provinces?: string[];
  }) {
    console.log('call popularity', search, categories, minPrice, maxPrice, provinces);

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('product.reviews', 'review')
      .leftJoin('product.orderDetails', 'orderDetail')
      .leftJoin('orderDetail.order', 'order')
      .where('seller.deletedAt IS NULL')
      .andWhere('product.deletedAt IS NULL')
      .andWhere('product.status = :status', {
        status: SellProductType.SELLING,
      })
      .addSelect(
        `SUM(CASE WHEN \`order\`.\`orderStatus\` NOT IN (:...excludedStatuses) THEN \`orderDetail\`.\`quantity\` ELSE 0 END)`,
        'soldCount',
      )
      .groupBy('product.id')
      .addGroupBy('seller.id')
      .addGroupBy('review.id')
      .orderBy('soldCount', 'DESC')
      .setParameter('excludedStatuses', [
        OrderStatusType.CANCELLED,
        OrderStatusType.REJECTED,
        OrderStatusType.REFUNDED,
      ]);

    if (search) {
      qb.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }
    if (categories) {
      qb.andWhere('product.category IN (:...categories)', { categories });
    }
    if (minPrice) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }
    if (provinces) {
      qb.andWhere('seller.province IN (:...provinces)', { provinces });
    }

    return await paginate<Product, PaginatedProduct>(qb, PaginatedProduct, {
      limit,
      page,
      total: true,
      additionalFields: ['soldCount'],
    });
  }

  async getRecommendProducts({
    search,
    categories,
    limit,
    page,
    provinces,
    searchHistory,
    viewHistory,
    minPrice,
    maxPrice,
  }: {
    search?: string;
    categories?: CategoryType[];
    limit: number;
    page: number;
    provinces?: string[];
    minPrice?: string;
    maxPrice?: string;
    searchHistory?: string[];
    viewHistory?: string[];
  }) {
    const payload = {
      search_history: !search ? searchHistory : [],
      viewed_product_ids: !search ? viewHistory : [],
      min_price: minPrice ? minPrice : 0,
      max_price: maxPrice ? maxPrice : undefined,
      provinces: provinces,
      categories: categories,
      page: page,
      page_size: limit,
      search: search,
    };
    const res = await axios.post(
      `${process.env.RECOMMEND_SERVICE_URL}/recommend`,
      payload,
    );
    console.log("rcm payload", payload)
    const res_page = res.data.page;
    const res_total = res.data.total;
    const res_page_size = res.data.page_size;
    const listId = res.data.recommended_products?.map((item: any) => item.id);

    const res_products = await this.productRepository.find({
      where: { id: In(listId) },
      relations: [
        'seller',
        'reviews',
        'orderDetails',
        'orderDetails.order',
        'verify',
      ],
    });

    return {
      first: res_page * res_page_size + 1,
      last: res_page * res_page_size + res_page_size,
      limit: res_page_size,
      total: res_total,
      data: res_products,
    };
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
        'product.orderDetails',
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
      .addOrderBy('orderDetailCount', 'DESC')
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

  async addProductQuantity(id: string, quantity: number, storeId: string) {
    const product = await this.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.quantity += quantity;
    this.restockingService.createRestocking({
      storeId,
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
  async getSimilarityProduct(productId: string) {
    const res = await axios.get(
      `${process.env.RECOMMEND_SERVICE_URL}/similar-products/${productId}`,
    );
    const listId = res.data.similar_products?.map((item: any) => item.id);
    return this.productRepository.find({
      where: { id: In(listId) },
      relations: ['seller', 'reviews', 'orderDetails', 'orderDetails.order'],
    });
  }
  async getFiveStar() {
    return this.productRepository.find({
      where: { star: 5, status: SellProductType.SELLING },
      relations: ['seller', 'reviews', 'orderDetails', 'orderDetails.order'],
    });
  }
}
