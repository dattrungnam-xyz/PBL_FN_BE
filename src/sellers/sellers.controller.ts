import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
      const image = await this.cloudinaryService.uploadImageBase64(
        createSellerDto.avatar,
      );
      createSellerDto.avatar = image.url;
    }
    if (createSellerDto.banner) {
      const image = await this.cloudinaryService.uploadImageBase64(
        createSellerDto.banner,
      );
      createSellerDto.banner = image.url;
    }
    return this.sellersService.create(createSellerDto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateSellerDto: UpdateSellerDTO) {
    return this.sellersService.update(id, updateSellerDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getSellerById(@Param('id') id: string) {
    return this.sellersService.getSellerById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  getSellers() {
    return this.sellersService.getSellers();
  }
}
