import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { IsImage } from '../../common/validation/IsImage.constraint';

export class CreateReviewDTO {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsImage({ each: true })
  media: string[];

  @IsNotEmpty()
  @IsString()
  orderDetailId: string;
}
