import { IsNotEmpty, IsString } from 'class-validator';

export class chatDTO {
  @IsString()
  @IsNotEmpty()
  message: string;
}
