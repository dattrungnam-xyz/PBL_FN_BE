import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { User } from '../users/entity/user.entity';
import { UserDoesNotExistConstraint } from '../common/validation/UserDoesNotExist.constraint';
import { GoogleStrategy } from './google.strategy';
import { RefreshToken } from '../users/entity/refreshToken.entity';
import { JwtRefreshStrategy } from './jwtRefresh.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    UserDoesNotExistConstraint,
  ],
})
export class AuthModule {}
