import { useToken } from '@/context/token';
import { fetcherWithAuthorizationAndPagination } from '../fetcher';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';

declare global {
  namespace Cloudflare {
    export interface Page {
      id: string,
      name: string,
      domains: string[]
    }

    export interface PagesDeploymentStagesInfo {
      ended_on: null | string,
      name: string,
      started_on: null | string,
      status: 'success' | (string & {})
    }

    export interface PagesDeploymentInfo {
      aliases: string[] | null,
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
      is_skipped: boolean,
      latest_stage: PagesDeploymentStagesInfo,
      stages: PagesDeploymentStagesInfo[]
    }
  }
}

export function useCloudflarePagesProjects(accountId: string, pageIndex: number, perPage = 50) {
  const token = useToken();

  return useSWR<Cloudflare.APIResponse<Cloudflare.Page[]>, unknown, [string, string, number, number]>(
    [`client/v4/accounts/${accountId}/pages/projects`, token, pageIndex, perPage],
    fetcherWithAuthorizationAndPagination
  );
}

export function useCloudflarePagesDeployments(accountId: string, projectName: string) {
  const token = useToken();

  return useSWRInfinite<Cloudflare.APIResponse<Cloudflare.PagesDeploymentInfo[]>>(
    (pageIndex, previousData: Cloudflare.APIResponse<Cloudflare.PagesDeploymentInfo[]> | undefined) => {
      if (
        previousData?.result_info
        && pageIndex >= previousData.result_info.total_pages
      ) {
        return null;
      }
      return [`client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`, token, pageIndex, 100];
    },
    fetcherWithAuthorizationAndPagination,
    {
      // Make sure we will fetch all records at once
      // SWR hook will break early if getKey return null so there is no performance impact
      initialSize: 1_919_810_114_514
    }
  );
}
