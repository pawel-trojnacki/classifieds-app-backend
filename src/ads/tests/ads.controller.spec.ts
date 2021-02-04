import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UsersService } from '../../users/users.service';
import { adModelMock } from '../../shared/mocks/ad.mock';
import { AdsController } from '../ads.controller';
import { AdsService } from '../ads.service';
import { Ad } from '../schema/ad.schema';
import { FilesService } from '../../files/files.service';
import { ResMessage } from '../../shared/types/res-message';
import { AdCategories } from '../../shared/types/ad-categories';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

describe('AdsController', () => {
  let adsService: AdsService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdsController],
      providers: [
        AdsService,
        FilesService,
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: getModelToken(Ad.name),
          useValue: adModelMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    adsService = module.get<AdsService>(AdsService);
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Creating an ad', () => {
    const expectedResponse = { status: 'ok', message: ResMessage.AdCreated };

    it('should create an ad', () => {
      jest.spyOn(adsService, 'create').mockResolvedValueOnce(expectedResponse);

      const createAdDto = {
        title: 'Some Title',
        category: AdCategories.Laptops,
        state: 'used',
        price: 500,
        description: 'Lorem ipsum dolor sit amet',
      };

      return request(app.getHttpServer())
        .post('/ads')
        .send(createAdDto)
        .expect(HttpStatus.CREATED)
        .expect(expectedResponse);
    });

    it('should throw error when required field was not provided', () => {
      jest.spyOn(adsService, 'create').mockResolvedValueOnce(expectedResponse);

      const createAdDto = {
        category: AdCategories.Laptops,
        state: 'used',
        price: 500,
        description: 'Lorem ipsum dolor sit amet',
      };

      return request(app.getHttpServer())
        .post('/ads')
        .send(createAdDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw error when price is not a number or numeric string', () => {
      jest.spyOn(adsService, 'create').mockResolvedValueOnce(expectedResponse);

      const createAdDto = {
        title: 'Some Title',
        category: AdCategories.Laptops,
        state: 'used',
        price: 'test price',
        description: 'Lorem ipsum dolor sit amet',
      };

      return request(app.getHttpServer())
        .post('/ads')
        .send(createAdDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Getting ads', () => {
    const expectedResponse = { ads: [], pages: 1 };

    it('should return list of ads', () => {
      jest.spyOn(adsService, 'findAll').mockResolvedValueOnce(expectedResponse);

      return request(app.getHttpServer())
        .get('/ads')
        .expect(HttpStatus.OK)
        .expect(expectedResponse);
    });
  });
});
