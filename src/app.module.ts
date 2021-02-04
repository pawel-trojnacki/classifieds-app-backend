import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AdsModule } from './ads/ads.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { FavouritesModule } from './favourites/favourites.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zs69c.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    ),
    AdsModule,
    UsersModule,
    AuthModule,
    FilesModule,
    FavouritesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
