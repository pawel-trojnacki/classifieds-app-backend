import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AdsService } from '../ads/ads.service';
import { User } from '../users/schema/user.schema';
import { ResMessage } from '../shared/types/res-message';
import { mainResponse } from '../shared/utils/main-response';
import { MainResponse } from '../shared/types/response';
import { Ad } from '../ads/schema/ad.schema';

@Injectable()
export class FavouritesService {
  constructor(
    @Inject(forwardRef(() => AdsService))
    private adsService: AdsService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async findFavourites(user: User): Promise<Ad[]> {
    const favouriteAds = await Promise.all(
      user.favourites.map(
        async (ad) => await this.adsService.findOne(ad.toString()),
      ),
    );

    return favouriteAds;
  }

  async addToFavourites(user: User, id: string): Promise<Ad[]> {
    const ad = await this.adsService.adUserToFavouriteBy(user, id);
    const savedUser = await this.usersService.addAdToFavourites(user, ad);
    const favourites = await this.findFavourites(savedUser);
    return favourites;
    // return mainResponse(ResMessage.AdAddedToFavourites);
  }

  async removeFromFavourites(user: User, id: string): Promise<Ad[]> {
    const ad = await this.adsService.removeUserFromFavouriteBy(user, id);
    const savedUser = await this.usersService.removeAdFromFavourites(user, ad);
    const favourites = await this.findFavourites(savedUser);
    // return mainResponse(ResMessage.AdRemovedFromFavourites);
    return favourites;
  }
}
