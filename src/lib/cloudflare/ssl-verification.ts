import { useToken } from '@/context/token';
import { fetcherWithAuthorization } from '../fetcher';

import useSWR from 'swr';
import { useZoneId } from '../../hooks/use-zone-id';

interface VerificationInfoHttp {
  http_url: string,
  http_body: string
}

interface VerificationInfoCname {
  cname_target: string,
  cname: string
}

interface VerificationInfoTxt {
  txt_name: string,
  txt_value: string
}

declare global {
  namespace Cloudflare {
    export interface CertificateStatus {
      brand_check: boolean,
      hostname: string,
      cert_pack_uuid: string,
      certificate_status: 'initializing' | 'authorizing' | 'active' | 'expired' | 'issuing' | 'timing_out' | 'pending_deployment' | 'pending_validation',
      signature: 'ECDSAWithSHA256' | 'SHA1WithRSA' | 'SHA256WithRSA',
      verification_status: boolean,
      validation_method: 'http' | 'cname' | 'txt',
      validation_type?: string,
      verification_info?: VerificationInfoHttp |
        VerificationInfoCname |
        VerificationInfoTxt |
        Array<VerificationInfoHttp | VerificationInfoCname | VerificationInfoTxt> |
        undefined
    }
  }
}

export const useCloudflareSSLVerificationLists = () => useSWR<Cloudflare.APIResponse<Cloudflare.CertificateStatus[]>, unknown, [string, string]>(
  [`client/v4/zones/${useZoneId()}/ssl/verification`, useToken()],
  fetcherWithAuthorization
);

export const updateCloudflareSSLVerification = async (token: string, zoneId: string, uuid: string, validation_method: string) => fetcherWithAuthorization<Cloudflare.APIResponse<{ validation_method: string }>>(
  [`client/v4/zones/${zoneId}/ssl/verification/${uuid}`, token],
  {
    method: 'PATCH',
    body: JSON.stringify({
      validation_method
    })
  }
);
