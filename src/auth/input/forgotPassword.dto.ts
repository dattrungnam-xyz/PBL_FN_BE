import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPassWordDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
