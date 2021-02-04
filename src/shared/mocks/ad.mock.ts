import { Document } from 'mongoose';
import { AdCategories } from '../types/ad-categories';

export interface AdDoc extends Document {
  title: string;
  creator: string;
  createdAt: Date;
  category: string;
  price: number;
  state: 'used' | 'new';
  description: string;
  images: string[];
  favouriteBy: string[];
  delete: () => null;
  save: () => null;
}

export interface AdMock {
  _id?: string;
  title?: string;
  creator?: string;
  category?: string;
  price?: number;
  state?: 'used' | 'new';
  description?: string;
  images?: string[];
  favouriteBy?: string[];
  createdAt?: Date;
  delete: () => null;
  save: () => null;
}

export const adMock = (
  _id = 'ad1',
  title = 'First Ad',
  creator = 'u1',
  category = AdCategories.Laptops,
  price = 399,
  state: 'used' | 'new' = 'used',
  description = 'Lorem ipsum dolor sit amet.',
  images = [],
  favouriteBy = [],
  createdAt = new Date(),
) => ({
  _id,
  title,
  creator,
  createdAt,
  category,
  price,
  state,
  description,
  images,
  favouriteBy,
  delete: () => null,
  save: () => null,
});

export const adListMock: AdMock[] = [
  adMock(),
  adMock('ad2', 'Second Ad', 'u1', AdCategories.Tablets, 500),
  adMock('ad3', 'Third Ad', 'u2', AdCategories.Smartphones, 700, 'new'),
];

export const adDocMock = (mock?: AdMock): Partial<AdDoc> => ({
  _id: (mock && mock._id) || 'ad1',
  title: (mock && mock.title) || 'First Ad',
  creator: (mock && mock.creator) || 'ui',
  createdAt: (mock && mock.createdAt) || new Date(),
  category: (mock && mock.category) || AdCategories.Laptops,
  price: (mock && mock.price) || 399,
  state: (mock && mock.state) || 'used',
  description: (mock && mock.description) || 'Lorem ipsum dolor sit amet.',
  images: (mock && mock.images) || [],
  favouriteBy: (mock && mock.favouriteBy) || [],
  delete: () => null,
  save: () => null,
});

export const adModelMock = {
  create: jest.fn().mockResolvedValue(adMock()),
  findById: jest.fn(),
  find: jest.fn(),
};
