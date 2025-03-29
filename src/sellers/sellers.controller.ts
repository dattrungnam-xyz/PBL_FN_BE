import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDTO } from './dto/createSeller.dto';
import { JwtAuthGuard } from '../auth/authGuard.jwt';
import { UpdateSellerDTO } from './dto/updateSeller.dto';
import { Role } from '../common/type/role.type';
import { Roles } from '../common/decorator/role.decorator';
import { CurrentUser } from '../common/decorator/currentUser.decorator';
import { User } from '../users/entity/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('sellers')
export class SellersController {
  constructor(
    private readonly sellersService: SellersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createSellerDto: CreateSellerDTO,
    @CurrentUser() user: User,
  ) {
    if (createSellerDto.avatar) {
      createSellerDto.avatar = (
        await this.cloudinaryService.uploadImageBase64(createSellerDto.avatar)
      ).url;
    }
    if (createSellerDto.banner) {
      createSellerDto.banner = (
        await this.cloudinaryService.uploadImageBase64(createSellerDto.banner)
      ).url;
    }
    return this.sellersService.create(createSellerDto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateSellerDto: UpdateSellerDTO) {
    return this.sellersService.update(id, updateSellerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  getSellers() {
    return this.sellersService.getSellers();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  getSellerByUser(@CurrentUser() user: User) {
    if (!user.storeId) {
      throw new BadRequestException('User not have store');
    }
    return this.sellersService.getSellerById(user.storeId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getSellerById(@Param('id') id: string) {
    return this.sellersService.getSellerById(id);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateSeller(
    @Body() updateSellerDto: UpdateSellerDTO,
    @CurrentUser() user: User,
  ) {
    if (updateSellerDto.avatar && !updateSellerDto.avatar.startsWith('http')) {
      updateSellerDto.avatar = (
        await this.cloudinaryService.uploadImageBase64(updateSellerDto.avatar)
      ).url;
    }
    if (updateSellerDto.banner && !updateSellerDto.banner.startsWith('http')) {
      updateSellerDto.banner = (
        await this.cloudinaryService.uploadImageBase64(updateSellerDto.banner)
      ).url;
    }
    return this.sellersService.update(user.storeId, updateSellerDto);
  }
}
