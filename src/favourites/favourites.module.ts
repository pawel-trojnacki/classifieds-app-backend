import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdsModule } from '../ads/ads.module';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';

@Module({
  imports: [forwardRef(() => AdsModule), forwardRef(() => UsersModule)],
  controllers: [FavouritesController],
  providers: [FavouritesService],
})
export class FavouritesModule {}
