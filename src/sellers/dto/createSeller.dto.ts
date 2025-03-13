import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSellerDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  latitude: number;
}
