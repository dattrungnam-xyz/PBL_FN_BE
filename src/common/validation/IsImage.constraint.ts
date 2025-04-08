import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsImage(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isImage',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          // Check if it's a base64 image
          const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
          if (base64Regex.test(value)) {
            return true;
          }

          // Check if it's a URL image
          const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*\.(png|jpg|jpeg|gif|webp)(\?.*)?$/;
          if (urlRegex.test(value)) {
            return true;
          }

          return false;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be either a valid Base64 encoded image or a valid image URL`;
        },
      },
    });
  };
} 