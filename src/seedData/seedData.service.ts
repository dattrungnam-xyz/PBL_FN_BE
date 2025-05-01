import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entity/product.entity';
import { User } from '../users/entity/user.entity';
import { Seller } from '../sellers/entity/seller.entity';
import { SeedUserStoreProductDto } from './dto/seedUserStoreProduct.dto';
import { AuthService } from '../auth/auth.service';
import { CreateUserDTO } from '../auth/input/createUser.dto';
import { Role } from '../common/type/role.type';
import { SellersService } from '../sellers/sellers.service';
import { ProductsService } from '../products/products.service';
import axios from 'axios';
import { SellProductType } from '../common/type/sellProduct.type';
import { CategoryType } from '../common/type/category.type';

@Injectable()
export class SeedDataService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    private authService: AuthService,
    private sellerService: SellersService,
    private productService: ProductsService,
  ) {}

  async seedUserStoreProduct(seedUserStoreProductDto: SeedUserStoreProductDto) {
    const { location, storeName, products } = seedUserStoreProductDto;
    // create User
    const user = await this.authService.createUser({
      email: `${'user' + Date.now()}@gmail.com`,
      username: `${'user' + Date.now()}`,
      password: '1234567',
      passwordConfirm: '1234567',
      name: 'user' + Date.now(),
      roles: [Role.USER],
    });

    // create seller
    const province = await this.getProvince();
    const provinceId = province.find(
      (p) => p.name.toLowerCase().trim() === location.toLowerCase().trim(),
    )?.id;
    const provinceName = province.find((p) => p.id === provinceId)?.name;
    if (!provinceId) {
      throw new BadRequestException('Province not found');
    }
    const district = await this.getDistrict(provinceId);
    // get random district
    const randomDistrict =
      district[Math.floor(Math.random() * district.length)];
    const districtId = randomDistrict.id;
    const districtName = randomDistrict.name;
    const ward = await this.getWard(districtId);
    // get random ward
    const randomWard = ward[Math.floor(Math.random() * ward.length)];
    const wardId = randomWard.id;
    const wardName = randomWard.name;
    const seller = await this.sellerService.create(
      {
        name: storeName,
        phone: '0909090909',
        email: `${'user' + Date.now()}@gmail.com`,
        address: location,
        province: provinceId,
        provinceName: provinceName,
        district: districtId,
        districtName: districtName,
        ward: wardId,
        wardName: wardName,
        description: 'wellcome to ' + storeName,
        avatar: undefined,
        banner: undefined,
      },
      user,
    );

    // create product
    for (const product of products) {
      await this.productService.createProduct(seller.id, {
        name: product.productName,
        description: product.description,
        price: this.formatPrice(product.price),
        quantity: Math.floor(Math.random() * 150) + 50,
        category: this.getCategory(product.category),
        status: SellProductType.SELLING,
        star: product.star,
        images: product.productImage,
      });
    }
  }

  formatPrice(price: string) {
    return parseInt(price.replace('đ', '').replace(/\./g, ''), 10);
  }
  async getProvince() {
    const res = await axios.get('https://open.oapi.vn/location/provinces', {
      params: {
        page: 0,
        size: 1000,
      },
    });
    return res.data.data;
  }

  async getDistrict(provinceId: string) {
    const res = await axios.get(
      `https://open.oapi.vn/location/districts/${provinceId}`,
      {
        params: {
          page: 0,
          size: 1000,
        },
      },
    );
    return res.data.data;
  }

  async getWard(districtId: string) {
    const res = await axios.get(
      `https://open.oapi.vn/location/wards/${districtId}`,
      {
        params: {
          page: 0,
          size: 1000,
        },
      },
    );
    return res.data.data;
  }
  getCategory(category: string) {
    if (category === 'Thực phẩm') {
      return CategoryType.FOOD;
    }
    if (category === 'Thảo dược') {
      return CategoryType.HERB;
    }
    if (category === 'Đồ uống') {
      return CategoryType.BEVERAGE;
    }
    return CategoryType.HANDICRAFTS_DECORATION;
  }
}
