import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { errResponse } from '../shared/utils/err-response';
import { User } from '../users/schema/user.schema';
import { mainResponse } from '../shared/utils/main-response';
import { ErrMessage, ResMessage } from '../shared/types/res-message';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  createToken(
    currentToken: string,
  ): { accessToken: string; expiresIn: string } {
    const payload = { id: currentToken };
    const expiresIn = '24h';
    const accessToken = sign(payload, process.env.AUTH_SECRET, { expiresIn });
    return { accessToken, expiresIn };
  }

  async generateToken(user: User): Promise<string> {
    let token: string;
    let userWithThisToken: null | User;

    do {
      token = uuid();
      userWithThisToken = await this.usersService.findByCurrentToken(token);
    } while (!!userWithThisToken);

    user.currentToken = token;
    await user.save();
    return token;
  }

  async login(loginDto: LoginDto, res: Response): Promise<any> {
    const { email, password } = loginDto;
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        return res.status(401).json(errResponse(ErrMessage.InvalidCredentials));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json(errResponse(ErrMessage.InvalidCredentials));
      }

      const currentToken = await this.generateToken(user);
      const token = this.createToken(currentToken);

      user.isOnline = true;
      await user.save();

      return res
        .cookie('jwt', token.accessToken, {
          domain: `${process.env.CLIENT_DOMAIN}`,
          httpOnly: false,
          sameSite: 'none',
          secure: true,
        })
        .json(mainResponse(ResMessage.LoggedIn));
    } catch {
      return res.status(500).json(errResponse(ErrMessage.Unknown));
    }
  }

  async logout(user: User, res: Response): Promise<any> {
    try {
      user.isOnline = false;
      user.lastSeen = new Date();
      user.currentToken = null;
      await user.save();

      res
        .clearCookie('jwt', {
          domain: `${process.env.CLIENT_DOMAIN}`,
          httpOnly: false,
          sameSite: 'none',
          secure: true,
        })
        .json(mainResponse(ResMessage.LoggedOut));
    } catch {
      return res.status(500).json(errResponse(ErrMessage.Unknown));
    }
  }
}
