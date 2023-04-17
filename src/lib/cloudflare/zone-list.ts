import { useToken } from '@/context/token';
import { fetcherWithAuthorizationAndPagination } from '../fetcher';
import useSWR, { preload } from 'swr';

declare global {
  namespace Cloudflare {
    export interface ZoneStatus {
      activated_on: string,
      created_on: string,
      /** The interval (in seconds) from when development mode expires (positive integer) or last expired (negative integer) for the domain. If development mode has never been enabled, this value is 0. */
      development_mode: number,
      id: string,
      modified_on: string,
      name: string,
      original_dnshost: string,
      original_name_servers: string[],
      original_registrar: string,
      /** @private */
      status: string,
      /** @private */
      host?: {
        name: string,
        website: string,
      }
    }
  }
}

export const useCloudflareZoneList = (pageIndex: number, perPage = 20, search = '') => {
  const token = useToken();
  const path = search ? `client/v4/zones?name=contains:${search}` : 'client/v4/zones';
  return useSWR<Cloudflare.APIResponse<Cloudflare.ZoneStatus[]>>(
    token ? [path, token, pageIndex, perPage] : null,
    fetcherWithAuthorizationAndPagination,
    {
      keepPreviousData: true
    }
  );
};

export const preloadCloudflareZoneList = (token: string) => {
  preload<Cloudflare.APIResponse<Cloudflare.ZoneStatus[]>>(
    ['client/v4/zones', token, 1],
    fetcherWithAuthorizationAndPagination
  );
};
