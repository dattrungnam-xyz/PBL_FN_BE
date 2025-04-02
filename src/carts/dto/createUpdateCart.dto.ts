import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateUpdateCartDTO {
    @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;
}
