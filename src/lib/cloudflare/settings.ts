import { useToken } from '@/context/token';
import { fetcherWithAuthorization, handleFetchError } from '../fetcher';
import useSWR, { mutate } from 'swr';
import { useZoneId } from '@/hooks/use-zone-id';
import { useCallback, useState } from 'react';

declare global {
  namespace Cloudflare {
    export type ZoneSettingBooleanType = 'on' | 'off';

    export interface SettingsCommon<Extension = ZoneSettingBooleanType> {
      id?: string,
      editable: boolean,
      value: Extension,
      modified_on?: string
    }

    export interface UpdateSettings<Extension = ZoneSettingBooleanType> {
      value: Extension
    }

    export interface ZoneSettingsValue {
      '0rtt': ZoneSettingBooleanType,
      advanced_ddos: ZoneSettingBooleanType,
      brotli: ZoneSettingBooleanType,
      ciphers: string[],
      early_hints: ZoneSettingBooleanType,
      h2_prioritization: ZoneSettingBooleanType,
      http2: ZoneSettingBooleanType,
      http3: ZoneSettingBooleanType,
      ipv6: ZoneSettingBooleanType,
      orange_to_orange: ZoneSettingBooleanType,
      origin_error_page_pass_thru: ZoneSettingBooleanType,
      origin_max_http_version: '1' | '2',
      polish: 'off' | 'lossless' | 'lossy',
      privacy_pass: ZoneSettingBooleanType,
      webp: ZoneSettingBooleanType,
      // eslint-disable-next-line @typescript-eslint/ban-types -- magic
      proxy_read_timeout: string & {},
      security_level: 'off' | 'essentially_off' | 'low' | 'medium' | 'high' | 'under_attack',
      tls_1_3: 'off' | 'on' | 'zrt',
      waf: ZoneSettingBooleanType
    }
  }
}

export const useCloudflareZoneAllSettingsAsFallback = () => {
  return useSWR<Cloudflare.APIResponse<Cloudflare.SettingsCommon[]>>(
    [`client/v4/zones/${useZoneId()}/settings`, useToken()],
    fetcherWithAuthorization
  );
};

export const useCloudflareZoneSetting = <K extends keyof Cloudflare.ZoneSettingsValue>(key: K) => {
  return useSWR<Cloudflare.APIResponse<Cloudflare.SettingsCommon<Cloudflare.ZoneSettingsValue[K]>>>(
    [`client/v4/zones/${useZoneId()}/settings/${key}`, useToken()],
    fetcherWithAuthorization
  );
};

export const useUpdateCloudflareZoneSetting = <K extends keyof Cloudflare.ZoneSettingsValue>(settingKey: K, title: string) => {
  const [isMutating, setIsMutating] = useState(false);
  const zoneId = useZoneId();
  const token = useToken();

  const trigger = useCallback(async (value: Cloudflare.ZoneSettingsValue[K]) => {
    setIsMutating(true);

    try {
      if (!token) throw new Error('There is no token.');

      const url = `client/v4/zones/${zoneId}/settings/${settingKey}`;
      const swrKey = [url, token] as [string, string];
      const resp = await fetcherWithAuthorization<Cloudflare.APIResponse<Cloudflare.SettingsCommon<Cloudflare.ZoneSettingsValue[K]>>>(
        swrKey,
        { method: 'PATCH', body: JSON.stringify({ value }) }
      );

      await mutate(swrKey, resp, { populateCache: true, revalidate: false });
      setIsMutating(false);

      return true;
    } catch (e) {
      handleFetchError(
        e,
        `Failed to update settings for ${title}.`
      );
      setIsMutating(false);

      return false;
    }
  }, [settingKey, title, token, zoneId]);

  return {
    trigger,
    isMutating
  };
};
