import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MainResponse } from '../shared/types/response';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/')
  create(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<MainResponse> {
    return this.usersService.create(createUserDto, res);
  }
}
