import { useToken } from '@/provider/token';
import { fetcherWithAuthorization } from '../fetcher';
import useSWR from 'swr';

declare global {
  namespace Cloudflare {
    export interface ZoneStatus {
      activated_on: string,
      created_on: string,
      development_mode: number,
      id: string,
      modified_on: string,
      name: string,
      original_dnshost: string,
      original_name_servers: string[],
      original_registrar: string
    }
  }
}

export const useCloudflareZoneList = () => {
  const token = useToken();

  return useSWR<Cloudflare.APIResponse<Cloudflare.ZoneStatus[]>>(
    token ? ['client/v4/zones', token] : null,
    fetcherWithAuthorization
  );
};
