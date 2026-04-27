import { useData } from '@/lib/tayori';
import { UserApiTokensService } from '@/sdk';
import { useMemo } from 'react';

export function useCloudflareApiTokenStatus() {
  return useData(UserApiTokensService.userApiTokensVerifyToken, {});
}

export function useIsCloudflareApiTokenValid() {
  const { data } = useCloudflareApiTokenStatus();
  return useMemo(() => data?.result?.status === 'active', [data]);
}
