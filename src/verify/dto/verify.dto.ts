import { IsEnum, IsNotEmpty } from 'class-validator';
import { VerifyOCOPStatus } from '../../common/type/verifyOCOP.type';

export class VerifyDTO {
  @IsNotEmpty()
  @IsEnum(VerifyOCOPStatus)
  status: VerifyOCOPStatus;
}
