import { useData } from '@/lib/tayori';
import { UserApiTokensService } from '@/sdk';

export function useCloudflareApiTokenStatus() {
  return useData(UserApiTokensService.userApiTokensVerifyToken, {});
}
