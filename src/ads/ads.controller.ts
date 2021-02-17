import {
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseBoolPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserObject } from '../shared/decorators/user-obj.decortor';
import { FindAllAdsResponse, MainResponse } from '../shared/types/response';
import { User } from '../users/schema/user.schema';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { Ad } from './schema/ad.schema';
import { SortOptions } from '../shared/types/sort-options';
import { AdCategories } from '../shared/types/ad-categories';
import { allowedPrice } from '../shared/constants/allowed-price';

@Controller('/ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  findUserAds(@UserObject() user: User): Promise<Ad[]> {
    return this.adsService.findUserAds(user);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('/')
  create(
    @UserObject() user: User,
    @Body() createAdDto: CreateAdDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<MainResponse> {
    return this.adsService.create(user, createAdDto, files);
  }

  @Get('/')
  findAll(
    @Query('p', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('sort', new DefaultValuePipe(SortOptions.Newest)) sort: SortOptions,
    @Query('category', new DefaultValuePipe('all'))
    category: AdCategories | 'all',
    @Query('minprice', new DefaultValuePipe(allowedPrice.min), ParseIntPipe)
    minPrice: number,
    @Query('maxprice', new DefaultValuePipe(allowedPrice.max), ParseIntPipe)
    maxPrice: number,
    @Query('withimages', new DefaultValuePipe(false), ParseBoolPipe)
    withImages: boolean,
    @Query('phrase', new DefaultValuePipe('')) search: string,
  ): Promise<FindAllAdsResponse> {
    return this.adsService.findAll(
      page,
      sort,
      category,
      minPrice,
      maxPrice,
      withImages,
      search,
    );
  }

  @Get('/:id')
  findOneWithCreator(@Param('id') id: string): Promise<Ad> {
    return this.adsService.findOneWithCreator(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Patch('/:id')
  update(
    @UserObject() user: User,
    @Param('id') id: string,
    @Body() updateAdDto: UpdateAdDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<MainResponse> {
    return this.adsService.update(user, id, updateAdDto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  remove(
    @UserObject() user: User,
    @Param('id') id: string,
  ): Promise<MainResponse> {
    return this.adsService.remove(user, id);
  }
}
