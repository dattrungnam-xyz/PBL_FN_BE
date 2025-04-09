import { IsArray, IsEnum, IsUUID } from 'class-validator';
import { OrderStatusType } from '../../common/type/orderStatus.type';

export class UpdateOrdersStatusDTO {
  @IsArray()
  orderIds: string[];

  @IsEnum(OrderStatusType)
  status: OrderStatusType;
}
