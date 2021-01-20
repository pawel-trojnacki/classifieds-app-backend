import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ResMessage } from '../../shared/types/res-message';
import { DocumentQuery, Model } from 'mongoose';
import { createMock } from '@golevelup/nestjs-testing';
import { adModelMock, adMock, AdDoc } from '../../shared/mocks/ad.mock';
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

  it('should create ad successfully', async () => {
    const mockedUser = userMock();

    const res = await adsService.create(
      mockedUser as User,
      {
        title: 'First Ad',
        category: 'laptops',
        state: 'used',
        price: '399',
        description: 'Lorem ipsum dolor sit amet.',
      },
      null,
    );

    expect(res).toEqual({ status: 'ok', message: ResMessage.AdCreated });
  });

  it('should update ad successfully', async () => {
    const mockedUserAds = ['123456789'];
    const mockedAdId = '123456789';

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
              mockedAdId,
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
      price: '1800',
      description: 'Some changed description',
    };

    const res = await adsService.update(
      mockedUser as User,
      mockedAdId,
      updateAdDto,
      null,
    );

    expect(res).toEqual({ status: 'ok', message: ResMessage.AdUpdated });
  });

  it('should remove ad successfully', async () => {
    const mockedUserAds = ['123456789'];
    const mockedAdId = '123456789';

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
        exec: jest.fn().mockResolvedValue(adMock(mockedAdId)),
      }),
    );

    const res = await adsService.remove(mockedUser as User, mockedAdId);
    expect(res).toEqual({ status: 'ok', message: ResMessage.AdDeleted });
  });
});
