import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from '../users/entity/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
        const { name, emails, photos } = profile;
        const user = new User()
        user.email = emails[0].value;
        user.avatar = photos[0].value;
        user.name = name.givenName + " " + name.familyName;
        done(null, user);
      } catch (error) {
        Logger.error(error);
        const internalError = new InternalServerErrorException();
        done(internalError);
        throw internalError;
      }
  }
}
