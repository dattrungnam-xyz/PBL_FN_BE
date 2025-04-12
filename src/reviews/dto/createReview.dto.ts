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
import { IsImageOrVideo } from '../../common/validation/IsImageOrVideo.constraint';

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
  @IsImageOrVideo({ each: true })
  media: string[];

  @IsNotEmpty()
  @IsString()
  orderDetailId: string;
}
