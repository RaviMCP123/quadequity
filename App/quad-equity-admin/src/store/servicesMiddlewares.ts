import { apiMiddleware } from '../middleware/apiMiddleware';
import { baseApi } from '@services/baseApi';

export const apiMiddlewares = [
  apiMiddleware,
  baseApi.middleware,
] as const;