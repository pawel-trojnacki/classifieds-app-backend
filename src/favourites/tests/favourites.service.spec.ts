import { Test, TestingModule } from '@nestjs/testing';
import { AdsService } from '../../ads/ads.service';
import { UsersService } from '../../users/users.service';
import { FavouritesService } from '../favourites.service';
import { userMock } from '../../shared/mocks/user.mock';
import { adMock } from '../../shared/mocks/ad.mock';
import { User } from '../../users/schema/user.schema';
import { ResMessage } from '../../shared/types/res-message';

describe('FavouritesService', () => {
  let favouritesService: FavouritesService;
  let adsService: AdsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavouritesService,
        {
          provide: AdsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(adMock()),
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
    }).compile();

    favouritesService = module.get<FavouritesService>(FavouritesService);
    adsService = module.get<AdsService>(AdsService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Getting favourite ads', () => {
    it('should return list of favourite ads', async () => {
      const mockedUser = userMock(
        'u1',
        'User 1',
        'email@email.com',
        '+48123456789',
        'abcdefgh',
        [],
        ['first ad id', 'second ad id'],
      );

      const res = await favouritesService.findFavourites(mockedUser as User);
      expect(res).toHaveLength(mockedUser.favourites.length);
    });

    it('should return empty array', async () => {
      const userWithoutFavouriteAds = userMock();

      const res = await favouritesService.findFavourites(
        userWithoutFavouriteAds as User,
      );
      expect(res).toEqual([]);
    });
  });

  describe('Adding ad to favourites', () => {
    it('should call adsService and userService functions', async () => {
      const mockedUser = userMock();
      const res = await favouritesService.addToFavourites(
        mockedUser as User,
        'some ad id',
      );

      expect(adsService.adUserToFavouriteBy).toHaveBeenCalledTimes(1);
      expect(usersService.addAdToFavourites).toHaveBeenCalledTimes(1);
      expect(res).toEqual({
        status: 'ok',
        message: ResMessage.AdAddedToFavourites,
      });
    });
  });

  describe('Removing ad from favourites', () => {
    it('should call adsService and userService functions', async () => {
      const mockedUser = userMock();
      const res = await favouritesService.removeFromFavourites(
        mockedUser as User,
        'some ad id',
      );

      expect(adsService.removeUserFromFavouriteBy).toHaveBeenCalledTimes(1);
      expect(usersService.removeAdFromFavourites).toHaveBeenCalledTimes(1);
      expect(res).toEqual({
        status: 'ok',
        message: ResMessage.AdRemovedFromFavourites,
      });
    });
  });
});
