import { IsOptional, IsString } from 'class-validator';

export class RequestCancelDTO {
  @IsOptional()
  @IsString()
  cancelReason: string;
}
