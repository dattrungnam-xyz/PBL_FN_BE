import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entity/user.entity';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sendMail', () => {
    it('should send mail', async () => {
      let mockUser = { id: '1' } as User;
      let mockUrl = 'url';
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({});

      let mailServiceSpy = jest.spyOn(service, 'sendMailResetPassword');
      await service.sendMailResetPassword(mockUser, mockUrl);
      expect(mailServiceSpy).toHaveBeenCalledWith(mockUser, mockUrl);
      expect(mailerService.sendMail).toHaveBeenCalled();
    });
  });
});
