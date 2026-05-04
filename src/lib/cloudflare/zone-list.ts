import { useData } from '@/lib/tayori';
import { ZoneService } from '@/sdk';

export function useCloudflareZoneList(pageIndex: number, perPage = 20, search = '') {
  return useData(
    ZoneService.zonesGet,
    {
      page: pageIndex,
      per_page: perPage,
      ...(search ? { name: `contains:${search}` } : {})
    },
    { keepPreviousData: true }
  );
}
