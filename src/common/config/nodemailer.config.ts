import { TransportType } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export const mailerOption: TransportType = {
  service: 'Gmail',
  secure: true,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
};
