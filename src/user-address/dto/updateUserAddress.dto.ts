import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserAddressDTO } from './createUserAddress.dto';
import { PartialType } from '@nestjs/mapped-types';
export class UpdateUserAddressDTO extends PartialType(CreateUserAddressDTO) {
  @IsOptional()
  @IsBoolean()
  isDefault: boolean;
}
