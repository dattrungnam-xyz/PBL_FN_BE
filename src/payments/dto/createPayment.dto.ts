import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentMethodType } from '../../common/type/paymentMethod.type';
import { PaymentStatusType } from '../../common/type/paymentStatus.type';

export class CreatePaymentDTO {
  @IsNotEmpty()
  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;

  @IsOptional()
  @IsEnum(PaymentStatusType)
  paymentStatus: PaymentStatusType;

  @IsOptional()
  @IsString()
  transactionId: string;
}
