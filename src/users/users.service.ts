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
import { User } from './schema/user.schema';
import { ErrMessage } from '../shared/types/res-message';
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

  async findById(id: string): Promise<User> {
    return await this.userModel.findById(id).exec();
  }

  async addAd(user: User, ad: Ad): Promise<User> {
    user.ads = [...user.ads, ad._id];
    return await user.save();
  }

  async removeAd(user: User, ad: Ad): Promise<User> {
    user.ads = user.ads.filter((userAd) => {
      return userAd.toString() !== ad._id.toString();
    });

    return await user.save();
  }

  async create(
    createUserDto: CreateUserDto,
    res: Response,
  ): Promise<MainResponse> {
    const { username, email, phone, password } = createUserDto;

    const isExistingEmail = await this.findByEmail(email);
    if (isExistingEmail) {
      throw new ConflictException(ErrMessage.UserExists);
    }

    const isExistingPhone = await this.findByPhone(phone);
    if (isExistingPhone) {
      throw new ConflictException(ErrMessage.UserExists);
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

  async addAdToFavourites(user: User, ad: Ad): Promise<User> {
    user.favourites = [...user.favourites, ad._id];
    return await user.save();
  }

  async removeAdFromFavourites(user: User, ad: Ad): Promise<User> {
    user.favourites = user.favourites.filter((favouriteAd) => {
      return favouriteAd.toString() !== ad._id.toString();
    });

    return await user.save();
  }
}
