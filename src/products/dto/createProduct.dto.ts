import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  details: string;

  @IsOptional()
  @IsString()
  usageInstructions: string;

  @IsOptional()
  @IsString()
  storageInstructions: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
