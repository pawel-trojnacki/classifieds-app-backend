import {
  BadRequestException,
  ConflictException,
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
import { AdCategories } from '../shared/types/ad-categories';
import { Filters } from '../shared/types/filters';

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
    const { title, category, state, price, description } = createAdDto;

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
      description,
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
    search: string,
  ): Promise<FindAllAdsResponse> {
    const ADS_PER_PAGE = 8;

    const sortOption =
      sort === SortOptions.PriceAsc
        ? { price: 1 }
        : sort === SortOptions.PrideDesc
        ? { price: -1 }
        : { createdAt: -1 };

    const filters: Filters = {
      price: { $gte: minPrice, $lte: maxPrice },
    };

    if (category && category !== 'all') {
      filters.category = category;
    }

    if (withImages) {
      filters.images = { $ne: [] };
    }

    if (!!search) {
      const regexWithOptions = { $regex: search, $options: 'i' };
      filters.$or = [
        { title: regexWithOptions },
        { description: regexWithOptions },
      ];
    }

    const ads = await this.adModel
      .find(filters)
      .sort(sortOption)
      .limit(ADS_PER_PAGE)
      .skip(page > 1 ? (page - 1) * ADS_PER_PAGE : 0)
      .exec();

    const adsNumber = await this.adModel.find(filters).countDocuments();
    const pages = Math.ceil(adsNumber / ADS_PER_PAGE);

    return { ads, pages };
  }

  async findOne(id: string): Promise<Ad> {
    try {
      const ad = await this.adModel.findById(id).exec();
      if (!ad) {
        throw new NotFoundException(ErrMessage.NoAd);
      }
      return ad;
    } catch {
      throw new NotFoundException(ErrMessage.NoAd);
    }
  }

  async findOneWithCreator(id: string): Promise<Ad> {
    try {
      const ad = await this.adModel
        .findById(id)
        .populate({
          path: 'creator',
          select: 'username email phone isOnline lastSeen ads',
          populate: {
            path: 'ads',
          },
        })
        .exec();

      if (!ad) {
        throw new NotFoundException(ErrMessage.NoAd);
      }
      return ad;
    } catch {
      throw new NotFoundException(ErrMessage.NoAd);
    }
  }

  async findUserAds(user: User): Promise<Ad[]> {
    try {
      const { _id } = user;
      const ads = await this.adModel.find({ creator: _id }).exec();
      return ads;
    } catch {
      throw new NotFoundException(ErrMessage.NoUser);
    }
  }

  async adUserToFavouriteBy(user: User, id: string): Promise<Ad> {
    const userId = user._id;
    const ad = await this.findOne(id);

    if (ad.favouriteBy.includes(userId)) {
      throw new ConflictException(ErrMessage.UserHasAdInFavourites);
    }

    ad.favouriteBy = [...ad.favouriteBy, userId];

    return await ad.save();
  }

  async removeUserFromFavouriteBy(user: User, id: string): Promise<Ad> {
    const userId = user._id;
    const ad = await this.findOne(id);

    if (!ad.favouriteBy.includes(userId)) {
      throw new NotFoundException(ErrMessage.UserDoesNotHaveAdInFavourites);
    }

    ad.favouriteBy = ad.favouriteBy.filter((user) => {
      return user.toString() !== userId.toString();
    });

    return await ad.save();
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

    const { favouriteBy } = ad;

    const isAuthorized = ads.map((ad) => ad.toString()).includes(id);
    if (!isAuthorized) {
      throw new UnauthorizedException(ErrMessage.Unauthorized);
    }

    if (ad.images.length > 0) {
      await this.filesService.removeFiles(ad.images);
    }

    if (!!favouriteBy && favouriteBy.length > 0) {
      const users = await Promise.all(
        favouriteBy.map(
          async (user) => await this.usersService.findById(user.toString()),
        ),
      );

      users.forEach(
        async (user) =>
          await this.usersService.removeAdFromFavourites(user, ad),
      );
    }

    await this.usersService.removeAd(user, ad);

    await ad.delete();

    return mainResponse(ResMessage.AdDeleted);
  }
}
