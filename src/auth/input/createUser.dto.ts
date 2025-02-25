import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { UserDoesNotExist } from '../../common/validation/UserDoesNotExist.constraint';
import { IsRepeated } from '../../common/validation/IsRepeated.constraint';
import { Role } from '../../common/type/role.type';

export class CreateUserDTO {
  @IsNotEmpty()
  @Length(6)
  @IsString()
  @UserDoesNotExist()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @UserDoesNotExist()
  email: string;

  @IsNotEmpty()
  @Length(6)
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsRepeated('password')
  passwordConfirm: string;

  @IsNotEmpty()
  @IsEnum(Role, { each: true, message: 'Invalid role.' })
  roles: Role[];
}
