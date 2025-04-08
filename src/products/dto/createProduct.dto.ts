import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  ValidateIf,
  Max,
} from 'class-validator';
import { CategoryType } from '../../common/type/category.type';
import { SellProductType } from '../../common/type/sellProduct.type';
import { IsImage } from '../../common/validation/IsImage.constraint';
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
  @IsNumber()
  @IsPositive()
  @Min(0)
  @Max(5)
  star: number;

  @IsNotEmpty()
  @IsEnum(CategoryType)
  category: CategoryType;

  @IsNotEmpty()
  @IsEnum(SellProductType)
  status: SellProductType;

  @IsNotEmpty()
  @IsArray()
  @ValidateIf((o) => o.images && o.images.length > 0)
  @IsImage({ each: true })
  images: string[];
}
