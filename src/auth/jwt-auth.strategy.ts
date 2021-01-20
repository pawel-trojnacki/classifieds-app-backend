import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { User } from '../users/schema/user.schema';
import { cookieExtractor } from '../shared/utils/cookie-extractor';
import { UsersService } from '../users/users.service';
import { ErrMessage } from '../shared/types/res-message';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.AUTH_SECRET,
    });
  }

  async validate(
    payload: { id: string },
    done: (error: Error, user: User | null) => void,
  ) {
    if (!payload || !payload.id) {
      return done(new UnauthorizedException(ErrMessage.Unauthorized), null);
    }

    const user = await this.usersService.findByCurrentToken(payload.id);

    if (!user) {
      return done(new UnauthorizedException(ErrMessage.Unauthorized), null);
    }

    done(null, user);
  }
}
