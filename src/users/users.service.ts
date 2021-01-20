import {
  ConflictException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';
import { mainResponse } from '../shared/utils/main-response';
import { ResMessage } from '../shared/types/res-message';
import { MainResponse } from '../shared/types/response';
import { Ad } from '../ads/schema/ad.schema';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findByPhone(phone: string): Promise<User> {
    return await this.userModel.findOne({ phone }).exec();
  }

  async findByCurrentToken(currentToken: string): Promise<User> {
    return await this.userModel.findOne({ currentToken }).exec();
  }

  async addAd(user: User, ad: Ad): Promise<User> {
    user.ads = [...user.ads, ad._id];
    return await user.save();
  }

  async create(
    createUserDto: CreateUserDto,
    res: Response,
  ): Promise<MainResponse> {
    const { username, email, phone, password } = createUserDto;

    const isExistingEmail = await this.findByEmail(email);
    if (isExistingEmail) {
      throw new ConflictException('User with this email already exists.');
    }

    const isExistingPhone = await this.findByPhone(phone);
    if (isExistingPhone) {
      throw new ConflictException(
        'User with this phone number already exists.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userModel.create({
      username,
      email,
      phone,
      password: hashedPassword,
      ads: [],
      favourites: [],
      currentToken: null,
      isOnline: false,
      lastSeen: new Date(),
    });

    return await this.authService.login({ email, password }, res);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
