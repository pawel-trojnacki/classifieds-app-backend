import { createMock } from '@golevelup/nestjs-testing';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { DocumentQuery, Model } from 'mongoose';
import { mockResponse } from 'mock-req-res';
import { UserDoc, userMock, userModelMock } from '../../shared/mocks/user.mock';
import { User } from '../schema/user.schema';
import { UsersService } from '../users.service';
import { MainResponse } from '../../shared/types/response';
import { AuthService } from '../../auth/auth.service';
import { ErrMessage } from '../../shared/types/res-message';

describe('UsersService', () => {
  let usersService: UsersService;
  let authService: AuthService;
  let model: Model<UserDoc>;

  const response = mockResponse({
    status: jest.fn(),
    cookie: jest.fn(),
    json: (value: MainResponse) => value,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
    model = module.get<Model<UserDoc>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('should create user successfully', async () => {
    const mockedUser = userMock();

    jest.spyOn(model, 'findOne').mockReturnValue(
      createMock<DocumentQuery<UserDoc, UserDoc, unknown>>({
        exec: jest.fn().mockResolvedValue(null),
      }),
    );

    jest.spyOn(authService, 'login').mockResolvedValue(mockedUser);

    const createUser = await usersService.create(
      {
        username: 'User 1',
        email: 'email@email.com',
        phone: '+48123456789',
        password: 'abcdefgh',
      },
      response,
    );

    expect(createUser).toEqual(mockedUser);
  });

  it('should throw an error when user already exists', async (done) => {
    const mockedUser = userMock();

    jest.spyOn(model, 'findOne').mockReturnValue(
      createMock<DocumentQuery<UserDoc, UserDoc, unknown>>({
        exec: jest.fn().mockResolvedValue(mockedUser),
      }),
    );

    jest.spyOn(authService, 'login').mockResolvedValue(mockedUser);

    await usersService
      .create(
        {
          username: 'User 1',
          email: 'email@email.com',
          phone: '+48123456789',
          password: 'abcdefgh',
        },
        response,
      )
      .then(() => done.fail('does not throw expected error'))
      .catch((err) => {
        expect(err.status).toBe(HttpStatus.CONFLICT);
        expect(err.message).toBe(ErrMessage.UserExists);
      });

    done();
  });
});
