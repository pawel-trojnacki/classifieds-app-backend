import { Document } from 'mongoose';

export interface UserDoc extends Document {
  username: string;
  email: string;
  phone: string;
  password: string;
  ads: string[];
  favourites: string[];
  currentToken: string | null;
  isOnline: boolean;
  lastSeen: Date;
  save: () => null;
}

export interface IUser {
  _id: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  ads: string[];
  favourites: string[];
  currentToken: string | null;
  isOnline: boolean;
  lastSeen: Date;
  save: () => null;
}

export interface UserMock {
  _id?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  ads?: string[];
  favourites?: string[];
  currentToken?: string | null;
  isOnline?: boolean;
  lastSeen?: Date;
  save: () => null;
}

export const userMock = (
  _id = 'u1',
  username = 'User 1',
  email = 'email@email.com',
  phone = '+48123456789',
  password = 'abcdefgh',
  ads = [],
  favourites = [],
  currentToken = null,
  isOnline = false,
  lastSeen = new Date(),
  save = () => null,
) => ({
  _id,
  username,
  email,
  phone,
  password,
  ads,
  favourites,
  currentToken,
  isOnline,
  lastSeen,
  save,
});

export const userDocMock = (mock?: UserMock): Partial<UserMock> => ({
  _id: (mock && mock._id) || 'u1',
  username: (mock && mock.username) || 'User 1',
  email: (mock && mock.email) || 'email@email.com',
  phone: (mock && mock.phone) || '+48123456789',
  password: (mock && mock.password) || 'abcdefgh',
  ads: (mock && mock.ads) || [],
  favourites: (mock && mock.favourites) || [],
  currentToken: (mock && mock.currentToken) || null,
  isOnline: (mock && mock.isOnline) || false,
  lastSeen: (mock && mock.lastSeen) || new Date(),
  save:
    (mock && mock.save) ||
    function () {
      return null;
    },
});

export const userModelMock = {
  constructor: jest.fn().mockResolvedValue(userMock()),
  create: jest.fn().mockResolvedValue(userMock()),
  findOne: jest.fn(),
};
