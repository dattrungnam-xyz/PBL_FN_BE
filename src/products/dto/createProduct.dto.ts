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
  @ValidateIf((o) => o.images && o.images.length > 0)
  @Matches(/^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/, {
    message: 'Images must be a valid Base64 encoded image',
    each: true,
  })
  images: string[];
}
