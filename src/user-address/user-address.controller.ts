import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { User } from '../users/entity/user.entity';
import { JwtAuthGuard } from '../auth/authGuard.jwt';
import { CurrentUser } from '../common/decorator/currentUser.decorator';
import { UpdateUserAddressDTO } from './dto/updateUserAddress.dto';
import { CreateUserAddressDTO } from './dto/createUserAddress.dto';

@Controller('user-address')
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserAddresses(@CurrentUser() user: User) {
    return this.userAddressService.getUserAddresses(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createUserAddress(
    @CurrentUser() user: User,
    @Body() body: CreateUserAddressDTO,
  ) {
    return this.userAddressService.createUserAddress(user.id, body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUserAddress(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateUserAddressDTO,
  ) {
    return this.userAddressService.updateUserAddress(user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUserAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.userAddressService.deleteUserAddress(user.id, id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.userAddressService.getUserAddress(user.id, id);
  }
}
