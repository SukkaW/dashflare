import { useToken } from '@/context/token';
import { fetcherWithAuthorization } from '../fetcher';
import useSWR from 'swr';
import { useZoneId } from '@/hooks/use-zone-id';

declare global {
  namespace Cloudflare {
    export interface SettingsCommon<Extension = 'on' | 'off'> {
      id?: string,
      status: Extension
    }
  }
}

export const useCloudflareZoneSettings = () => {
  return useSWR<Cloudflare.APIResponse<Cloudflare.SettingsCommon[]>>(
    [`client/v4/zones/${useZoneId()}/settings`, useToken()],
    fetcherWithAuthorization
  );
};
