import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { mockResponse } from 'mock-req-res';
import { MainResponse } from '../../shared/types/response';
import { userMock, userModelMock } from '../../shared/mocks/user.mock';
import { User } from '../../users/schema/user.schema';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import { errResponse } from '../../shared/utils/err-response';
import { ErrMessage, ResMessage } from '../../shared/types/res-message';
import { mainResponse } from '../../shared/utils/main-response';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let bcryptCompare: jest.Mock;

  const res = mockResponse({
    status: jest.fn(),
    cookie: jest.fn(),
    json: (value: MainResponse) => value,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should log in user successfully', async () => {
    bcryptCompare = jest.fn().mockResolvedValue(true);
    (bcrypt.compare as jest.Mock) = bcryptCompare;

    const user = userMock();

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as never);

    jest
      .spyOn(authService, 'generateToken')
      .mockResolvedValue('12345678' as never);

    jest
      .spyOn(authService, 'createToken')
      .mockResolvedValue('12345678' as never);

    const loginUser = await authService.login(
      {
        email: 'email@email.com',
        password: 'abcdefgh',
      },
      res,
    );

    expect(loginUser).toEqual(mainResponse(ResMessage.LoggedIn));
  });

  it('should return error when provided password is wrong', async () => {
    bcryptCompare = jest.fn().mockResolvedValue(false);
    (bcrypt.compare as jest.Mock) = bcryptCompare;

    const user = userMock();

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as never);

    jest
      .spyOn(authService, 'generateToken')
      .mockResolvedValue('12345678' as never);

    jest
      .spyOn(authService, 'createToken')
      .mockResolvedValue('12345678' as never);

    const loginUser = await authService.login(
      {
        email: 'email@email.com',
        password: 'abcd',
      },
      res,
    );

    expect(loginUser).toEqual(errResponse(ErrMessage.InvalidCredentials));
  });
});
