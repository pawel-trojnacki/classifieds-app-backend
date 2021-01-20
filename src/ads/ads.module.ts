import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { Ad, AdSchema } from './schema/ad.schema';
import { UsersModule } from '../users/users.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ad.name, schema: AdSchema }]),
    UsersModule,
    FilesModule,
  ],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}
