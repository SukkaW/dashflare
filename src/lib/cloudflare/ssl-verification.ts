import { useData, useMutation } from '@/lib/tayori';
import { SslVerificationService } from '@/sdk';
import { useZoneId } from '@/hooks/use-params';

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
      verification_info?: VerificationInfoHttp
        | VerificationInfoCname
        | VerificationInfoTxt
        | Array<VerificationInfoHttp | VerificationInfoCname | VerificationInfoTxt>
        | undefined
    }
  }
}

export function useCloudflareSSLVerificationLists() {
  const zoneId = useZoneId();
  return useData(
    SslVerificationService.sslVerificationSslVerificationDetails,
    { zone_id: zoneId }
  );
}

export function useUpdateCloudflareSSLVerification() {
  const zoneId = useZoneId();
  const { trigger: sdkTrigger, ...rest } = useMutation(
    SslVerificationService.sslVerificationEditSslCertificatePackValidationMethod
  );

  return {
    ...rest,
    trigger: (certPackUuid: string, validationMethod: string) => sdkTrigger({
      zone_id: zoneId,
      certificate_pack_id: certPackUuid,
      tlsCertificatesAndHostnamesComponentsSchemasValidationMethod: { validation_method: validationMethod as any }
    })
  };
}
