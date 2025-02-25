import {
  ArrayNotEmpty,
  IsArray,
  IsBase64,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/type/role.type';
import { UserDoesNotExist } from '../../common/validation/UserDoesNotExist.constraint';
import { IsDivisibleBy5 } from '../../common/validation/IsDivisibleBy5.constraint';

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  @UserDoesNotExist()
  email?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(900)
  @IsDivisibleBy5({ message: 'Target score must be divisible by 5' })
  targetScore?: number;

  @IsOptional()
  @IsDate()
  @IsNotEmpty({ message: 'Test date cannot be empty' })
  testDate: Date;

  @IsOptional()
  @MinLength(10)
  @MaxLength(11)
  @UserDoesNotExist()
  phone?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true, message: 'Invalid role.' })
  roles?: Role[];

  @IsOptional()
  @Matches(/^data:image\/(png|jpg|jpeg|gif);base64,[A-Za-z0-9+/]+={0,2}$/, {
    message:
      'Avatar must be a valid Base64 encoded image (PNG, JPG, JPEG, GIF)',
  })
  avatar?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  avatarUrl?: string;
}
