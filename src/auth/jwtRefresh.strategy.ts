import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../users/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const authUser = await this.userRepository.findOneBy({ id: payload.id });
    if (!authUser) {
      throw new UnauthorizedException();
    }
    if (!authUser.isActive) {
      throw new ForbiddenException('Your account is not active');
    }
    return {
      id: authUser.id,
      refreshTokenExpiresAt: new Date(payload.exp * 1000),
    };
  }
}
