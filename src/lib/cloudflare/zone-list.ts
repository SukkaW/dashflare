import { useToken } from '@/context/token';
import { fetcherWithAuthorizationAndPagination } from '../fetcher';
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

export const useCloudflareZoneList = (pageIndex: number, search = '') => {
  const token = useToken();
  const path = search ? `client/v4/zones?name=contains:${search}` : 'client/v4/zones';
  return useSWR<Cloudflare.APIResponse<Cloudflare.ZoneStatus[]>>(
    token ? [path, token, pageIndex] : null,
    fetcherWithAuthorizationAndPagination,
    {
      keepPreviousData: true
    }
  );
};
