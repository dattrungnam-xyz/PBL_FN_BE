import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsRepeated } from '../../common/validation/IsRepeated.constraint';

export class UpdatePasswordDTO {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @Length(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsRepeated('password')
  passwordConfirm: string;
}
