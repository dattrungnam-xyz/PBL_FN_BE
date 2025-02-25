import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../common/type/role.type';

export class UpdateRoleDTO {
  @IsNotEmpty({ each: true })
  @IsEnum(Role, { each: true })
  roles: Role[];
}
