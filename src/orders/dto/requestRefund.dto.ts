import { IsArray, IsOptional, IsUUID } from "class-validator";
import { IsString } from "class-validator";
import { IsNotEmpty } from "class-validator";
import { IsImageOrVideo } from "../../common/validation/IsImageOrVideo.constraint";

export class RequestRefundDTO {
  @IsString()
  @IsNotEmpty()
  refundReason: string;

  @IsOptional()
  @IsArray()
  @IsImageOrVideo({ each: true })
  refundReasonImage: string[];
}
