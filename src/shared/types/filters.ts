import { AdCategories } from './ad-categories';

interface RegexWithOptions {
  $regex: string;
  $options: string;
}

export interface Filters {
  price: { $gte: number; $lte: number };
  category?: AdCategories;
  images?: { $ne: [] };
  $or?: [{ title: RegexWithOptions }, { description: RegexWithOptions }];
}
