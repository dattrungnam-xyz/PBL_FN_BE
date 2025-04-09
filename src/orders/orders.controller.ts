import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/authGuard.jwt';
import { CreateOrderDTO } from './dto/createOrder.dto';
import { User } from '../users/entity/user.entity';
import { CurrentUser } from '../common/decorator/currentUser.decorator';
import { OrderStatusType } from '../common/type/orderStatus.type';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { UpdateOrderStatusDTO } from './dto/updateOrderStatus.dto';
import { UpdateOrdersStatusDTO } from './dto/updateOrdersStatus.dto';
import { Role } from '../common/type/role.type';
import { Roles } from '../common/decorator/role.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RejectOrderDTO } from './dto/rejectOrder.dto';
@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() createOrderDTO: CreateOrderDTO[],
    @CurrentUser() user: User,
  ) {
    const orderDetails = createOrderDTO.map((orderDetail) => {
      return this.ordersService.createOrder(user.id, orderDetail);
    });
    return await Promise.all(orderDetails);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getOrdersByUserId(@CurrentUser() user: User) {
    return this.ordersService.getOrdersByUserId(user.id);
  }

  @Get('seller')
  @UseGuards(JwtAuthGuard)
  async getUnpaidShopOrder(
    @CurrentUser() user: User,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('orderStatus') status?: OrderStatusType,
    @Query('province') province?: string,
    @Query('district') district?: string,
    @Query('ward') ward?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ordersService.getShopOrder(user.seller.id, {
      limit,
      page,
      search,
      orderStatus: status,
      province,
      district,
      ward,
      startDate,
      endDate,
    });
  }

  @Patch('status')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateOrdersStatus(
    @CurrentUser() user: User,
    @Body() updateOrdersStatusDTO: UpdateOrdersStatusDTO,
  ) {
    return this.ordersService.updateOrdersStatus(updateOrdersStatusDTO);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDTO: UpdateOrderStatusDTO,
  ) {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDTO);
  }

  @Patch(':id/reject/')
  @UseGuards(JwtAuthGuard)
  async rejectOrder(
    @Param('id') id: string,
    @Body() rejectOrderDTO: RejectOrderDTO,
  ) {
    return this.ordersService.rejectOrder(id, rejectOrderDTO);
  }
}
