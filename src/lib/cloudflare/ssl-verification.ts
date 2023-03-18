import { useToken } from '@/provider/token';
import { fetcherWithAuthorization } from '../fetcher';

import useSWR from 'swr';
import { useZoneId } from '../../hooks/use-zone-id';

interface CertificateStatusBase {
  brand_check: boolean,
  cert_pack_uuid: string,
  certificate_status: 'initializing' | 'authorizing' | 'active' | 'expired' | 'issuing' | 'timing_out' | 'pending_deployment',
  signature: 'ECDSAWithSHA256' | 'SHA1WithRSA' | 'SHA256WithRSA',
  verification_status: boolean
}

interface CertificateStatusHttp extends CertificateStatusBase {
  validation_method: 'http',
  verification_info: {
    http_url: string,
    http_body: string
  }
}

interface CertificateStatusCname extends CertificateStatusBase {
  validation_method: 'cname',
  verification_info: {
    cname_target: string,
    cname: string
  }
}

interface CertificateStatusTxt extends CertificateStatusBase {
  validation_method: 'txt',
  verification_info: {
    txt_name: string,
    txt_value: string
  }
}

declare global {
  namespace Cloudflare {
    export type CertificateStatus = CertificateStatusHttp | CertificateStatusCname | CertificateStatusTxt;
  }
}

export const useCloudflareSSLVerificationLists = () => {
  return useSWR<Cloudflare.APIResponse<Cloudflare.CertificateStatus[]>>(
    [`client/v4/zones/${useZoneId()}/ssl/verification`, useToken()],
    fetcherWithAuthorization
  );
};
