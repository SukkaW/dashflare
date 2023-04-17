import useSWR from 'swr';
import { useZoneId } from '@/hooks/use-zone-id';
import { useToken } from '@/context/token';
import { fetcherWithAuthorization, handleFetchError } from '@/lib/fetcher';

declare global {
  namespace Cloudflare {
    interface RulesetsInfo {
      description: string,
      id: string,
      kind: string,
      last_updated: string,
      name: string,
      phase: string,
      version: string
    }
  }
}

export const useCloudflareListRuleset = () => useSWR<Cloudflare.APIResponse<Cloudflare.RulesetsInfo[]>>(
  [
    `client/v4/zones/${useZoneId()}/rulesets`,
    useToken()
  ],
  fetcherWithAuthorization,
  {
    keepPreviousData: true,
    onError(error) {
      handleFetchError(error, 'Failed to list zone rulesets.');
    }
  }
);
