import { Type } from 'class-transformer';
import { IsArray, IsEnum, ValidateNested } from 'class-validator';

import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { PaymentMethodType } from '../../common/type/paymentMethod.type';

export class CreateOrderDTO {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  addressId: string;

  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @IsNotEmpty()
  @IsNumber()
  shippingFee: number;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  sellerId: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetails)
  orderDetails: CreateOrderDetails[];
}

class CreateOrderDetails {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
