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
import { RequestRefundDTO } from './dto/requestRefund.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RequestCancelDTO } from './dto/requestCancel.dto';
@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  @Patch(':id/request-refund/')
  @UseGuards(JwtAuthGuard)
  async requestRefund(
    @Param('id') id: string,
    @Body() requestRefundDTO: RequestRefundDTO,
  ) {
    if (requestRefundDTO.refundReasonImage) {
      const uploadedImages = await Promise.all(
        requestRefundDTO.refundReasonImage.map((image) =>
          this.cloudinaryService.uploadImageBase64(image),
        ),
      );
      requestRefundDTO.refundReasonImage = uploadedImages.map(
        (image) => image.url,
      );
    }
    return this.ordersService.requestRefund(id, requestRefundDTO);
  }

  @Patch(':id/request-cancel/')
  @UseGuards(JwtAuthGuard)
  async requestCancel(
    @Param('id') id: string,
    @Body() requestCancelDTO: RequestCancelDTO,
  ) {
    return this.ordersService.requestCancel(id, requestCancelDTO);
  }

  @Patch(':id/accept-cancel/')
  @UseGuards(JwtAuthGuard)
  async acceptCancel(@Param('id') id: string) {
    return this.ordersService.acceptCancel(id);
  }

  @Patch(':id/accept-refund/')
  @UseGuards(JwtAuthGuard)
  async acceptRefund(@Param('id') id: string) {
    return this.ordersService.acceptRefund(id);
  }

  @Patch(':id/reject-refund/')
  @UseGuards(JwtAuthGuard)
  async rejectRefund(
    @Param('id') id: string,
    @Body() rejectRefundDTO: { reason: string },
  ) {
    return this.ordersService.rejectRefund(id, rejectRefundDTO.reason);
  }

  @Get('analysis/revenue')
  @UseGuards(JwtAuthGuard)
  async getRevenue(
    @CurrentUser() user: User,
    @Query('type') type: 'year' | 'month' | 'week',
  ) {
    if (!user.seller || !type) {
      return {
        currentCycle: 0,
        previousCycle: 0,
        percentage: 0,
      };
    }
    return this.ordersService.getRevenueByType(user.seller.id, type);
  }

  @Get('analysis/revenue-by-category')
  @UseGuards(JwtAuthGuard)
  async getRevenueByCategory(
    @CurrentUser() user: User,
    @Query('type') type: 'year' | 'month' | 'week',
  ) {
    return this.ordersService.getRevenueByTypeAndCategory(user, type);
  }

  @Get('analysis/revenue-five-month')
  @UseGuards(JwtAuthGuard)
  async getRevenueFiveMonth(@CurrentUser() user: User) {
    return this.ordersService.getRevenueFiveMonth(user.seller.id);
  }

  @Get('analysis/order')
  @UseGuards(JwtAuthGuard)
  async getOrderCount(
    @CurrentUser() user: User,
    @Query('type') type: 'year' | 'month' | 'week',
  ) {
    if (!user.seller || !type) {
      return {
        currentCycle: 0,
        previousCycle: 0,
        percentage: 0,
        currentCycleTotalPrice: 0,
        previousCycleTotalPrice: 0,
      };
    }
    return this.ordersService.getOrderCountByType(user.seller.id, type);
  }

  @Get('analysis/customer')
  @UseGuards(JwtAuthGuard)
  async getCustomerCount(
    @CurrentUser() user: User,
    @Query('type') type: 'year' | 'month' | 'week',
  ) {
    if (!user.seller || !type) {
      return {
        currentCycle: 0,
        previousCycle: 0,
        percentage: 0,
      };
    }
    return this.ordersService.getCustomerCountByType(user.seller.id, type);
  }

  @Get('customers/statistics')
  @UseGuards(JwtAuthGuard)
  async getCustomerStatistics(@CurrentUser() user: User) {
    return this.ordersService.getCustomerStatistics(user.seller.id);
  }
}
