import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatusType } from '../../common/type/orderStatus.type';

export class UpdateOrderStatusDTO {
  @IsNotEmpty()
  @IsEnum(OrderStatusType)
  status: OrderStatusType;
}
