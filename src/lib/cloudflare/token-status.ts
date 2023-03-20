import { useToken } from '@/context/token';
import { fetcherWithAuthorization } from '../fetcher';

import useSWR from 'swr';
import { useMemo } from 'react';

declare global {
  namespace Cloudflare {
    export interface TokenStatus {
      /** The expiration time on or after which the JWT MUST NOT be accepted for processing. */
      expires_on?: string, // '2018-07-01T05:20:00Z',
      /** Token identifier tag. */
      id: string, // ed17574386854bf78a67040be0a770b0,
      /** The time before which the token MUST NOT be accepted for processing. */
      not_before?: string // '2018-07-01T05:20:00Z',
      /** Status of the token. */
      status: 'active' | 'disabled' | 'expired' // 'active'
    }
  }
}

export const useCloudflareApiTokenStatus = (token: string | null) => useSWR<Cloudflare.APIResponse<Cloudflare.TokenStatus>>(
  token ? ['client/v4/user/tokens/verify', token] : null,
  fetcherWithAuthorization
);

export const updateCloudflareApiTokenStatus = (token: string) => {
  fetcherWithAuthorization<Cloudflare.APIResponse<Cloudflare.TokenStatus>>(['client/v4/user/tokens/verify', token]);
};

export const useIsCloudflareApiTokenValid = () => {
  const token = useToken();
  const { isLoading, data } = useCloudflareApiTokenStatus(token);
  return useMemo(() => {
    if (!token) return false;
    if (isLoading) return false;
    if (!data) return false;

    return data.success && data.result.status === 'active';
  }, [data, isLoading, token]);
};
