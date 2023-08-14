import { fetcherWithAuthorization } from '../fetcher';

import useSWR from 'swr';

// declare global {
//   namespace Cloudflare {
//     export interface TokenStatus {
//       /** The expiration time on or after which the JWT MUST NOT be accepted for processing. */
//       expires_on?: string, // '2018-07-01T05:20:00Z',
//       /** Token identifier tag. */
//       id: string, // ed17574386854bf78a67040be0a770b0,
//       /** The time before which the token MUST NOT be accepted for processing. */
//       not_before?: string // '2018-07-01T05:20:00Z',
//       /** Status of the token. */
//       status: 'active' | 'disabled' | 'expired' // 'active'
//     }
//   }
// }

export const useCloudflareApiTokenDetails = (token: string | null, tokenId: string | undefined | null) => useSWR<Cloudflare.APIResponse>(
  (token && tokenId) ? [`client/v4/user/tokens/${tokenId}`, token] : null,
  fetcherWithAuthorization
);
