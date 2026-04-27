import { useData, useMutation } from '@/lib/tayori';
import { unstable_mutateWithTags } from 'tayori';
import { ZoneSettingsService } from '@/sdk';
import { useZoneId } from '@/hooks/use-params';
import { useCallback } from 'react';

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
      proxy_read_timeout: string & {},
      security_level: 'off' | 'essentially_off' | 'low' | 'medium' | 'high' | 'under_attack',
      tls_1_3: 'off' | 'on' | 'zrt',
      waf: ZoneSettingBooleanType,
      email_obfuscation: ZoneSettingBooleanType,
      automatic_https_rewrites: ZoneSettingBooleanType,
      rocket_loader: ZoneSettingBooleanType,
      minify: {
        css: ZoneSettingBooleanType,
        html: ZoneSettingBooleanType,
        js: ZoneSettingBooleanType
      }
    }
  }
}

export function useCloudflareZoneAllSettingsAsFallback() {
  const zoneId = useZoneId();
  return useData(
    ZoneSettingsService.zoneSettingsGetAllZoneSettings,
    { zone_id: zoneId }
  );
}

export function useCloudflareZoneSetting<K extends keyof Cloudflare.ZoneSettingsValue>(key: K) {
  const zoneId = useZoneId();
  return useData(
    ZoneSettingsService.zoneSettingsGetSingleSetting,
    { zone_id: zoneId, setting_id: key, cacheTags: [`#zone-setting-${key}` as const] }
  );
}

export function useUpdateCloudflareZoneSetting<K extends keyof Cloudflare.ZoneSettingsValue>(settingKey: K, _title: string) {
  const zoneId = useZoneId();
  const { trigger: sdkTrigger, isMutating } = useMutation(
    ZoneSettingsService.zoneSettingsEditSingleSetting
  );

  const trigger = useCallback(async (value: ZonesZoneSettingsSingleRequestWritable) => {
    try {
      await sdkTrigger({
        zone_id: zoneId,
        setting_id: settingKey,
        zonesZoneSettingsSingleRequestWritable: value
      });
      await unstable_mutateWithTags([`#zone-setting-${settingKey}`]);
      return true;
    } catch {
      return false;
    }
  }, [zoneId, settingKey, sdkTrigger]);

  return { trigger, isMutating };
}
