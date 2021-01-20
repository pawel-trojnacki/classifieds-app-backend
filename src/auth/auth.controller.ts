import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserObject } from '../shared/decorators/user-obj.decortor';
import { User } from 'src/users/schema/user.schema';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<any> {
    return this.authService.login(loginDto, res);
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@UserObject() user: User, @Res() res: Response) {
    return this.authService.logout(user, res);
  }
}
