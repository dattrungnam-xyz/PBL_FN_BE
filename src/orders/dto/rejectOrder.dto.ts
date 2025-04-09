import { IsOptional, IsString } from 'class-validator';

export class RejectOrderDTO {
  @IsOptional()
  @IsString()
  reason: string;
}
