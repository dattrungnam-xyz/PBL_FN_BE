import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSearchHistoryDTO {
  @IsNotEmpty()
  @IsString()
  search: string;
}
