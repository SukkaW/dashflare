import { useData, useMutation } from '@/lib/tayori';
import { UniversalSslSettingsForAZoneService } from '@/sdk';
import type { TlsCertificatesAndHostnamesUniversal } from '@/sdk';
import { useZoneId } from '@/hooks/use-params';

export function useCloudflareUniversalSSLSettings() {
  const zoneId = useZoneId();
  return useData(
    UniversalSslSettingsForAZoneService.universalSslSettingsForAZoneUniversalSslSettingsDetails,
    { zone_id: zoneId }
  );
}

export function useUpdateCloudflareUniversalSSLSettings() {
  const zoneId = useZoneId();
  const { trigger: sdkTrigger, ...rest } = useMutation(
    UniversalSslSettingsForAZoneService.universalSslSettingsForAZoneEditUniversalSslSettings
  );

  return {
    ...rest,
    trigger: (value: TlsCertificatesAndHostnamesUniversal) => sdkTrigger({
      zone_id: zoneId,
      tlsCertificatesAndHostnamesUniversal: value
    })
  };
}
