import { useInfinite } from '@/lib/tayori';
import { AccountsService } from '@/sdk';

export function useCloudflareAccounts() {
  return useInfinite(
    AccountsService.accountsListAccounts,
    (pageIndex, previousData) => {
      if (previousData?.result_info) {
        const { total_count = 0, per_page = 100 } = previousData.result_info;
        if (pageIndex >= Math.ceil(total_count / per_page)) {
          return null;
        }
      }
      return { page: pageIndex + 1, per_page: 100 };
    },
    { initialSize: 1_919_810_114_514 }
  );
}
