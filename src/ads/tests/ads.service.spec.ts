import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ErrMessage, ResMessage } from '../../shared/types/res-message';
import { DocumentQuery, Model } from 'mongoose';
import { createMock } from '@golevelup/nestjs-testing';
import { adModelMock, adMock, AdDoc } from '../../shared/mocks/ad.mock';
import { HttpStatus } from '@nestjs/common';
import { AdsService } from '../ads.service';
import { Ad } from '../schema/ad.schema';
import { UsersService } from '../../users/users.service';
import { FilesService } from '../../files/files.service';
import { userMock } from '../../shared/mocks/user.mock';
import { User } from '../../users/schema/user.schema';
import { AdCategories } from '../../shared/types/ad-categories';
import { UpdateAdDto } from '../dto/update-ad.dto';

describe('AdsService', () => {
  let adsService: AdsService;
  let model: Model<AdDoc>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdsService,
        FilesService,
        {
          provide: getModelToken(Ad.name),
          useValue: adModelMock,
        },
        {
          provide: UsersService,
          useValue: {
            addAd: jest.fn(),
            removeAd: jest.fn(),
          },
        },
      ],
    }).compile();

    adsService = module.get<AdsService>(AdsService);
    model = module.get<Model<AdDoc>>(getModelToken(Ad.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adsService).toBeDefined();
  });

  it('should return found ad', async () => {
    const MOCKED_AD_ID = '123456789';

    const mockedAd = adMock(MOCKED_AD_ID);

    jest.spyOn(model, 'findById').mockReturnValue(
      createMock<DocumentQuery<AdDoc, AdDoc, unknown>>({
        exec: jest.fn().mockResolvedValue(mockedAd),
      }),
    );

    const ad = await adsService.findOne(MOCKED_AD_ID);
    expect(ad).toEqual(mockedAd);
  });

  it('should throw error when ad with provided id does not exist', async (done) => {
    const MOCKED_AD_ID = '123456789';

    jest.spyOn(model, 'findById').mockReturnValue(
      createMock<DocumentQuery<AdDoc, AdDoc, unknown>>({
        exec: jest.fn().mockResolvedValue(null),
      }),
    );

    await adsService
      .findOne(MOCKED_AD_ID)
      .then(() => done.fail('does not return expected error'))
      .catch((err) => {
        expect(err.status).toBe(HttpStatus.NOT_FOUND);
        expect(err.message).toBe(ErrMessage.NoAd);
      });

    done();
  });

  it('should create ad successfully', async () => {
    const mockedUser = userMock();

    const res = await adsService.create(
      mockedUser as User,
      {
        title: 'First Ad',
        category: 'laptops',
        state: 'used',
        price: 399,
        description: 'Lorem ipsum dolor sit amet.',
      },
      null,
    );

    expect(res).toEqual({ status: 'ok', message: ResMessage.AdCreated });
  });

  it('should update ad successfully', async () => {
    const mockedUserAds = ['123456789'];
    const MOCKED_AD_ID = '123456789';

    const mockedUser = userMock(
      'u1',
      'User 1',
      'email@email.com',
      '+48123456789',
      'abcdefgh',
      mockedUserAds,
    );

    jest.spyOn(model, 'findById').mockReturnValue(
      createMock<DocumentQuery<AdDoc, AdDoc, unknown>>({
        exec: jest
          .fn()
          .mockResolvedValue(
            adMock(
              MOCKED_AD_ID,
              'Some Title',
              'u1',
              AdCategories.Laptops,
              2000,
              'used',
              'Some description',
            ),
          ),
      }),
    );

    const updateAdDto: UpdateAdDto = {
      title: 'Changed title',
      category: AdCategories.Laptops,
      state: 'used',
      price: 1800,
      description: 'Some changed description',
    };

    const res = await adsService.update(
      mockedUser as User,
      MOCKED_AD_ID,
      updateAdDto,
      null,
    );

    expect(res).toEqual({ status: 'ok', message: ResMessage.AdUpdated });
  });

  it('should remove ad successfully', async () => {
    const mockedUserAds = ['123456789'];
    const MOCKED_AD_ID = '123456789';

    const mockedUser = userMock(
      'u1',
      'User 1',
      'email@email.com',
      '+48123456789',
      'abcdefgh',
      mockedUserAds,
    );

    jest.spyOn(model, 'findById').mockReturnValue(
      createMock<DocumentQuery<AdDoc, AdDoc, unknown>>({
        exec: jest.fn().mockResolvedValue(adMock(MOCKED_AD_ID)),
      }),
    );

    const res = await adsService.remove(mockedUser as User, MOCKED_AD_ID);
    expect(res).toEqual({ status: 'ok', message: ResMessage.AdDeleted });
  });

  it('should throw an error when ad does not belong to current user', async (done) => {
    const mockedUserAds = ['123456789'];
    const MOCKED_AD_ID = 'other id';

    const mockedUser = userMock(
      'u1',
      'User 1',
      'email@email.com',
      '+48123456789',
      'abcdefgh',
      mockedUserAds,
    );

    jest.spyOn(model, 'findById').mockReturnValue(
      createMock<DocumentQuery<AdDoc, AdDoc, unknown>>({
        exec: jest.fn().mockResolvedValue(adMock(MOCKED_AD_ID)),
      }),
    );

    await adsService
      .remove(mockedUser as User, MOCKED_AD_ID)
      .then(() => done.fail('does not throw expected error'))
      .catch((err) => {
        expect(err.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(err.message).toBe(ErrMessage.Unauthorized);
      });

    done();
  });

  it('should throw error while trying to add to favourites by user that already has the ad in favourites', async (done) => {
    const MOCKED_AD_ID = 'some ad id';
    const MOCKED_USER_ID = 'some user id';
    const mockedAd = adMock(
      MOCKED_AD_ID,
      'Some title',
      'creator id',
      AdCategories.Laptops,
      1000,
      'used',
      'Some awsome description',
      [],
      [MOCKED_USER_ID],
    );
    const mockedUser = userMock(
      MOCKED_USER_ID,
      'User 1',
      'user@email.com',
      '+48123456789',
      'abcdefgh',
      [],
      [MOCKED_AD_ID],
    );

    jest
      .spyOn(adsService, 'findOne')
      .mockResolvedValueOnce((mockedAd as unknown) as Ad);

    await adsService
      .adUserToFavouriteBy(mockedUser as User, MOCKED_AD_ID)
      .then(() => done.fail('does not throw expected error'))
      .catch((err) => {
        expect(err.status).toBe(HttpStatus.CONFLICT);
        expect(err.message).toBe(ErrMessage.UserHasAdInFavourites);
      });

    done();
  });
});
