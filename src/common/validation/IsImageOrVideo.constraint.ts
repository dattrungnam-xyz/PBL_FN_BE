import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
  } from 'class-validator';
  
  export function IsImageOrVideo(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
      registerDecorator({
        name: 'isImageOrVideo',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
          validate(value: any): boolean {
            if (typeof value !== 'string') {
              return false;
            }
  
            // Check if it's a base64 image
            const base64ImageRegex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
            if (base64ImageRegex.test(value)) {
              return true;
            }
  
            // Check if it's a base64 video
            const base64VideoRegex = /^data:video\/(mp4|webm|ogg);base64,[A-Za-z0-9+/=]+$/;
            if (base64VideoRegex.test(value)) {
              return true;
            }
  
            // Check if it's a URL image
            const urlImageRegex = /^https?:\/\/[^\s/$.?#].[^\s]*\.(png|jpg|jpeg|gif|webp)(\?.*)?$/;
            if (urlImageRegex.test(value)) {
              return true;
            }
  
            // Check if it's a URL video
            const urlVideoRegex = /^https?:\/\/[^\s/$.?#].[^\s]*\.(mp4|webm|ogg)(\?.*)?$/;
            if (urlVideoRegex.test(value)) {
              return true;
            }
  
            return false;
          },
          defaultMessage(args: ValidationArguments): string {
            return `${args.property} must be either a valid Base64 encoded image/video or a valid image/video URL`;
          },
        },
      });
    };
  } 