import { useToken } from '@/context/token';
import { fetcherWithAuthorization } from '../fetcher';

import useSWR from 'swr';
import { useZoneId } from '../../hooks/use-zone-id';

declare global {
  namespace Cloudflare {
    export interface UniversalSSLSettings {
      enabled: boolean,
      certificate_authority: 'lets_encrypt' | 'google' | 'digicert'
    }
  }
}

export const useCloudflareUniversalSSLSettings = () => {
  return useSWR<Cloudflare.APIResponse<Cloudflare.UniversalSSLSettings>>(
    [`client/v4/zones/${useZoneId()}/ssl/universal/settings`, useToken()],
    fetcherWithAuthorization
  );
};

export const updateCloudflareUniversalSSLSettings = (key: [key: string, token: string | null], { arg }: { arg: Cloudflare.UniversalSSLSettings }) => {
  const [url, token] = key;
  if (!token) {
    throw new TypeError('Missing Token!');
  }

  return fetcherWithAuthorization<Cloudflare.APIResponse<Cloudflare.UniversalSSLSettings>>([url, token], {
    method: 'PATCH',
    body: JSON.stringify(arg)
  });
};
