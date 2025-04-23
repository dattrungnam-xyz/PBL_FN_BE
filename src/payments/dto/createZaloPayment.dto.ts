import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethodType } from '../../common/type/paymentMethod.type';

export class CreateZaloPaymentDTO {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;
}
