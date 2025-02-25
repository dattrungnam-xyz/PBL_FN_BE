import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entity/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  async sendMailResetPassword(user: User, url: string) {
    await this.mailerService.sendMail({
      to: user.email,
      from: 'datvtrg0510@gmail.com',
      subject: 'Reset your password',
      template: './forgetPassword',
      context: {
        email: user.email,
        url,
      },
    });
  }
}
