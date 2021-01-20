import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrMessage, ResMessage } from '../shared/types/res-message';
import { adState } from '../shared/constants/ad-state';
import { categories } from '../shared/constants/categories';
import { FindAllAdsResponse, MainResponse } from '../shared/types/response';
import { mainResponse } from '../shared/utils/main-response';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { Ad } from './schema/ad.schema';
import { User } from '../users/schema/user.schema';
import { UsersService } from '../users/users.service';
import { FilesService } from '../files/files.service';
import { SortOptions } from '../shared/types/sort-options';
import { AdCategories } from 'src/shared/types/ad-categories';

@Injectable()
export class AdsService {
  constructor(
    @InjectModel(Ad.name) private adModel: Model<Ad>,
    private usersService: UsersService,
    private filesService: FilesService,
  ) {}

  async create(
    user: User,
    createAdDto: CreateAdDto,
    files: Express.Multer.File[],
  ): Promise<MainResponse> {
    const { title, category, state, price } = createAdDto;

    if (!adState.includes(state)) {
      throw new BadRequestException('Incorrect state');
    }
    if (!categories.includes(category)) {
      throw new BadRequestException('Incorrect category');
    }

    let images: string[];

    if (files) {
      images = await this.filesService.uploadFiles(files);
    }

    const ad = await this.adModel.create({
      title,
      category,
      state,
      price: +price,
      images: images || [],
      creator: user._id,
      createdAt: new Date(),
      favouriteBy: [],
    });

    await this.usersService.addAd(user, ad);

    return mainResponse(ResMessage.AdCreated);
  }

  async findAll(
    page: number,
    sort: SortOptions,
    category: AdCategories | 'all',
    minPrice: number,
    maxPrice: number,
    withImages: boolean,
  ): Promise<FindAllAdsResponse> {
    const ADS_PER_PAGE = 2;

    const sortOption =
      sort === SortOptions.PriceAsc
        ? { price: 1 }
        : sort === SortOptions.PrideDesc
        ? { price: -1 }
        : { createdAt: -1 };

    interface Filters {
      price: { $gte: number; $lte: number };
      category?: AdCategories;
      images?: { $ne: [] };
    }

    const filters: Filters = {
      price: { $gte: minPrice, $lte: maxPrice },
    };

    if (category && category !== 'all') {
      filters.category = category;
    }

    if (withImages) {
      filters.images = { $ne: [] };
    }

    const ads = await this.adModel
      .find(filters)
      .sort(sortOption)
      .limit(ADS_PER_PAGE)
      .skip((page - 1) * ADS_PER_PAGE)
      .exec();

    const adsNumber = await this.adModel.find(filters).countDocuments();
    const pages = Math.ceil(adsNumber / ADS_PER_PAGE);
    return { ads, pages };
  }

  async findOne(id: string): Promise<Ad> {
    try {
      return await this.adModel.findById(id).exec();
    } catch {
      throw new NotFoundException(ErrMessage.NoAd);
    }
  }

  async update(
    user: User,
    id: string,
    updateAdDto: UpdateAdDto,
    files: Express.Multer.File[],
  ): Promise<MainResponse> {
    const { ads } = user;
    const { filesToRemove } = updateAdDto;
    // Just for test easier with Postman and avoid possible errors
    const filesToRemoveArr = Array.isArray(filesToRemove)
      ? filesToRemove
      : [filesToRemove];

    const ad = await this.findOne(id);

    const isAuthorized = ads.map((ad) => ad.toString()).includes(id);
    if (!isAuthorized) {
      throw new UnauthorizedException(ErrMessage.Unauthorized);
    }

    const updatedImages: string[] = [];
    let newImages: string[];

    if (filesToRemove && filesToRemoveArr.length > 0) {
      ad.images.forEach(
        (img) => !filesToRemoveArr.includes(img) && updatedImages.push(img),
      );
      await this.filesService.removeFiles(filesToRemoveArr);
    }

    if (files) {
      newImages = await this.filesService.uploadFiles(files);
      newImages.forEach((img) => updatedImages.push(img));
    }

    ad.images = updatedImages;

    for (const key in updateAdDto) {
      if (key !== 'filesToRemove') {
        ad[key] = key === 'price' ? Number(updateAdDto[key]) : updateAdDto[key];
      }
    }

    await ad.save();

    return mainResponse(ResMessage.AdUpdated);
  }

  async remove(user: User, id: string): Promise<MainResponse> {
    const { ads } = user;
    const ad = await this.findOne(id);

    const isAuthorized = ads.map((ad) => ad.toString()).includes(id);
    if (!isAuthorized) {
      throw new UnauthorizedException(ErrMessage.Unauthorized);
    }

    ad.images.length > 0 && (await this.filesService.removeFiles(ad.images));

    const updatedUserAds = ads.filter((ad) => ad.toString() !== id);
    user.ads = updatedUserAds;

    await user.save();
    await ad.delete();

    return mainResponse(ResMessage.AdDeleted);
  }
}
