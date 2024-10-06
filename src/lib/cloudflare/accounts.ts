import useSWRInfinite from 'swr/infinite';
import { useToken } from '@/context/token';
import { fetcherWithAuthorizationAndPagination } from '../fetcher';

declare global {
  namespace Cloudflare {
    export interface AccountInfo {
      created_on: string,
      id: string,
      name: string,
      settings: {
        abuse_contact_email: string,
        enforce_twofactor: boolean,
        use_account_custom_ns_by_default: boolean
      }
    }
  }
}

export const useCloudflareAccounts = () => {
  const token = useToken();

  return useSWRInfinite<Cloudflare.APIResponse<Cloudflare.AccountInfo[]>>(
    (pageIndex, previousData: Cloudflare.APIResponse<Cloudflare.AccountInfo[]> | undefined) => {
      if (
        previousData?.result_info
        && pageIndex >= previousData.result_info.total_pages
      ) {
        return null;
      }
      return ['client/v4/accounts', token, pageIndex, 100];
    },
    fetcherWithAuthorizationAndPagination,
    {
      // Make sure we will fetch all records at once
      // SWR hook will break early if getKey return null so there is no performance impact
      initialSize: 1_919_810_114_514
    }
  );
};
