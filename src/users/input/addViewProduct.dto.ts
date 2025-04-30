import { IsNotEmpty, IsString } from 'class-validator';

export class AddViewProductDto {
  @IsNotEmpty()
  @IsString()
  productId: string;
}
