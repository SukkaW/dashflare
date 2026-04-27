import { tayori } from 'tayori';
import type { Options } from '@/sdk';
import type { RequestResult } from '@/sdk/client';

export const {
  useData,
  useInfinite,
  useMutation,
  TayoriProvider
} = tayori<Options, RequestResult>();
