import { useData, useInfinite } from '@/lib/tayori';
import { PagesProjectService, PagesDeploymentService } from '@/sdk';

export function useCloudflarePagesProjects(accountId: string, pageIndex: number, perPage = 50) {
  return useData(
    PagesProjectService.pagesProjectGetProjects,
    { account_id: accountId, page: pageIndex, per_page: perPage }
  );
}

export function useCloudflarePagesDeployments(accountId: string, projectName: string) {
  return useInfinite(
    PagesDeploymentService.pagesDeploymentGetDeployments,
    (pageIndex, previousData) => {
      if (previousData?.result_info && pageIndex >= (previousData.result_info.total_pages ?? 0)) {
        return null;
      }
      return { account_id: accountId, project_name: projectName, page: pageIndex + 1, per_page: 100 };
    },
    { initialSize: 1_919_810_114_514 }
  );
}
