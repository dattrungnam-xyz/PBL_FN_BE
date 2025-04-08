import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  ArrayMaxSize,
  ValidateIf,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsImage } from '../../common/validation/IsImage.constraint';

export class CreateVerifyDTO {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsArray()
  @IsNotEmpty({ message: 'Product IDs are required' })
  @ArrayMaxSize(10, { message: 'Maximum 10 products can be verified at once' })
  productIds: string[];

  @IsNotEmpty({ message: 'Star rating is required' })
  @IsNumber()
  @Min(1, { message: 'Star rating must be at least 1' })
  @Max(5, { message: 'Star rating cannot exceed 5' })
  @Type(() => Number)
  star: number;

  @IsNotEmpty({ message: 'Manufacturer is required' })
  @IsString()
  @MaxLength(100, { message: 'Manufacturer name cannot exceed 100 characters' })
  manufacturer: string;

  @IsNotEmpty({ message: 'Verify date is required' })
  verifyDate: Date;

  @IsOptional()
  @IsArray()
  @ValidateIf((o) => o.images && o.images.length > 0)
  @IsImage({ each: true })
  @MaxLength(5000000, { message: 'Each image must not exceed 5MB', each: true })
  images?: string[];
}
