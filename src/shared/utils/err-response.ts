import { MainResponse } from '../types/response';
export const errResponse = (message: string): MainResponse => ({
  status: 'error',
  message,
});
