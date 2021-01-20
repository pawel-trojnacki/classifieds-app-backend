import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { adModelMock } from '../../shared/mocks/ad.mock';
import { AdsController } from '../ads.controller';
import { AdsService } from '../ads.service';
import { Ad } from '../schema/ad.schema';

describe('AdsController', () => {
  let controller: AdsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdsController],
      providers: [
        AdsService,
        {
          provide: getModelToken(Ad.name),
          useValue: adModelMock,
        },
      ],
    }).compile();

    controller = module.get<AdsController>(AdsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
