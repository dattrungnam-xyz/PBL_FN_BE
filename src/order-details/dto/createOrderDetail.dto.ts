import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderDetailDTO {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
