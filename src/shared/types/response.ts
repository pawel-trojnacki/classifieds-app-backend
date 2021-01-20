import { Ad } from '../../ads/schema/ad.schema';

export interface MainResponse {
  status: string;
  message: string;
}

export interface FindAllAdsResponse {
  ads: Ad[];
  pages: number;
}
