import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateSearchHistoryDTO {
  @IsNotEmpty()
  @IsArray()
  search: string[];
}
