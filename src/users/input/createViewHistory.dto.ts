import { IsArray, IsNotEmpty } from "class-validator";

import { IsString } from "class-validator";

export class CreateViewHistoryDTO {
  @IsArray()
  @IsNotEmpty()
  productIds: string[];
}
