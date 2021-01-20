import { MainResponse } from '../types/response';

export const mainResponse = (message: string): MainResponse => ({
  status: 'ok',
  message,
});
