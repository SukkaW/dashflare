import { useToken } from '@/context/token';
import { fetcherWithAuthorizationAndPagination } from '../fetcher';
import useSWRInfinite from 'swr/infinite';

declare global {
  namespace Cloudflare {
    export interface PagesDeploymentInfo {
      alias: string[],
      build_config: {
        build_caching: boolean,
        build_command: string,
        destination_dir: string,
        root_dir: string
      },
      created_on: string,
      environment: 'preview' | 'production',
      id: string,
      url: string,
      project_id: string,
      project_name: string,
      is_skipped: boolean
    }
  }
}

export const useCloudflarePagesDeployments = (accountId: string, projectName: string) => {
  const token = useToken();

  return useSWRInfinite<Cloudflare.APIResponse<Cloudflare.PagesDeploymentInfo[]>>(
    (pageIndex, previousData: Cloudflare.APIResponse<Cloudflare.PagesDeploymentInfo[]> | undefined) => {
      if (
        previousData?.result_info
        && pageIndex >= previousData.result_info.total_pages
      ) {
        return null;
      }
      return [`client/v4/pages/projects/${projectName}/deployments`, token, pageIndex, 100];
    },
    fetcherWithAuthorizationAndPagination,
    {
      // Make sure we will fetch all records at once
      // SWR hook will break early if getKey return null so there is no performance impact
      initialSize: 1_919_810_114_514
    }
  );
};
