import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginGoogleDTO {
  @IsNotEmpty()
  token: string;
}
