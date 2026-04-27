import { useData, useMutation } from '@/lib/tayori';
import { UserApiTokensService } from '@/sdk';

export function useCloudflareApiTokenDetails(tokenId: string | undefined | null) {
  return useData(
    UserApiTokensService.userApiTokensTokenDetails,
    tokenId ? { token_id: tokenId } : null
  );
}

export function useCloudflareVerifyApiToken() {
  return useMutation(UserApiTokensService.userApiTokensVerifyToken);
}
