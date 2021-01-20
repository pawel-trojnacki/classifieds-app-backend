import { createMock } from '@golevelup/nestjs-testing';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentQuery, Model } from 'mongoose';
import { ResMessage } from '../../shared/types/res-message';
import { UserDoc, userModelMock } from '../../shared/mocks/user.mock';
import { User } from '../schema/user.schema';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDoc>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDoc>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user successfully', async () => {
    jest.spyOn(model, 'findOne').mockReturnValue(
      createMock<DocumentQuery<UserDoc, UserDoc, unknown>>({
        exec: jest.fn().mockResolvedValue(null),
      }),
    );

    const res = await service.create({
      username: 'User 1',
      email: 'email@email.com',
      phone: '+48123456789',
      password: 'abcdefgh',
    });

    expect(res).toEqual({ status: 'ok', message: ResMessage.UserCreated });
  });
});
