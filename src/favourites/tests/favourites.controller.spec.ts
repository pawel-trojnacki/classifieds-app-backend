import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AdsService } from '../../ads/ads.service';
import { UsersService } from '../../users/users.service';
import { FavouritesController } from '../favourites.controller';
import { FavouritesService } from '../favourites.service';
import { ResMessage } from '../../shared/types/res-message';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

describe('FavouritesController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavouritesController],
      providers: [
        FavouritesService,
        {
          provide: AdsService,
          useValue: {
            adUserToFavouriteBy: jest.fn(),
            removeUserFromFavouriteBy: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            addAdToFavourites: jest.fn(),
            removeAdFromFavourites: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add ad to favourites', () => {
    return request(app.getHttpServer())
      .patch('/favourites/add/someid')
      .expect(HttpStatus.OK)
      .expect({ status: 'ok', message: ResMessage.AdAddedToFavourites });
  });

  it('should remove ad from favourites', () => {
    return request(app.getHttpServer())
      .patch('/favourites/remove/someid')
      .expect(HttpStatus.OK)
      .expect({ status: 'ok', message: ResMessage.AdRemovedFromFavourites });
  });
});
