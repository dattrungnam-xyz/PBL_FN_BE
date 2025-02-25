import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './createUser.dto';

export class ResetPasswordDTO extends PickType(CreateUserDTO, [
  'password',
  'passwordConfirm',
] as const) {}
