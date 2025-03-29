import {
  IsBase64,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateSellerDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.avatar !== '' && !o.avatar.startsWith('http'))
  @Matches(/^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/, {
    message: 'Avatar must be a valid Base64 encoded image',
  })
  avatar: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.banner !== '' && !o.banner.startsWith('http'))
  @Matches(/^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/, {
    message: 'Banner must be a valid Base64 encoded image',
  })
  banner: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  province: string;

  @IsOptional()
  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  ward: string;
}
