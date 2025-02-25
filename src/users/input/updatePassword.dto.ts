import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsRepeated } from '../../common/validation/IsRepeated.constraint';

export class UpdatePasswordDTO {
  @IsNotEmpty()
  @Length(6)
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsRepeated('password')
  passwordConfirm: string;
}
