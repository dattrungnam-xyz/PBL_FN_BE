import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Repository } from 'typeorm';
import { User } from '../../users/entity/user.entity';

@ValidatorConstraint({ name: 'UserDoesNotExist', async: true })
@Injectable()
export class UserDoesNotExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    let entity = await this.userRepository.findOneBy({
      [validationArguments.property]: value,
    });

    return entity === null;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} already taken`;
  }
}

export function UserDoesNotExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: UserDoesNotExistConstraint,
    });
  };
}
