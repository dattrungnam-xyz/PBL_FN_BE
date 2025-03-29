import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { CategoryType } from '../../common/type/category.type';
import { SellProductType } from '../../common/type/sellProduct.type';
export class CreateProductDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @IsEnum(CategoryType)
  category: CategoryType;

  @IsNotEmpty()
  @IsEnum(SellProductType)
  status: SellProductType;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  images: string[];
}
