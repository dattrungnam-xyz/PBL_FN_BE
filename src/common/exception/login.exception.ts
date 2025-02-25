import { HttpException, HttpStatus } from "@nestjs/common";

export class LoginException extends HttpException {
    constructor() {
      super('Invalid username or password', HttpStatus.BAD_REQUEST);
    }
  }