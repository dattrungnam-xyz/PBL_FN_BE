import { IsNotEmpty, IsString } from "class-validator";

export class ZaloPayCallbackDTO {
  @IsNotEmpty()
  @IsString()
  data: string;

  @IsNotEmpty()
  @IsString()
  mac: string;
}
