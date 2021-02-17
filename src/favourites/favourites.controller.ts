import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { User } from '../users/schema/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavouritesService } from './favourites.service';
import { UserObject } from '../shared/decorators/user-obj.decortor';
import { Ad } from 'src/ads/schema/ad.schema';

@Controller('/favourites')
export class FavouritesController {
  constructor(private favouritesService: FavouritesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  findFavourites(@UserObject() user: User): Promise<Ad[]> {
    return this.favouritesService.findFavourites(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/add/:id')
  addToFavourites(
    @UserObject() user: User,
    @Param('id') id: string,
  ): Promise<Ad[]> {
    return this.favouritesService.addToFavourites(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/remove/:id')
  removeFromFavourites(
    @UserObject() user: User,
    @Param('id') id: string,
  ): Promise<Ad[]> {
    return this.favouritesService.removeFromFavourites(user, id);
  }
}
