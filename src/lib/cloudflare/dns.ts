import { useData, useMutation } from '@/lib/tayori';
import { unstable_mutateWithTags } from 'tayori';
import { DnsRecordsForAZoneService } from '@/sdk';
import type { DnsRecordsDnsRecordPostWritable } from '@/sdk';
import { useZoneId } from '@/hooks/use-params';
import { useCallback } from 'react';

export const cloudflareValidDNSRecordTypes = ['A', 'AAAA', 'CNAME', 'TXT', 'SRV', 'LOC', 'MX', 'NS', 'SPF', 'CERT', 'DNSKEY', 'DS', 'NAPTR', 'SMIMEA', 'SSHFP', 'TLSA', 'URI'] as const;

export const currentlySupportedCloudflareDNSRecordTypes = new Set(['A', 'AAAA', 'CNAME', 'TXT', 'NS', 'SPF']);

const DNS_CACHE_TAG = '#dns-records' as const;

export function useCloudflareListDNSRecords(pageIndex: number, perPage = 20, search = '') {
  const zoneId = useZoneId();
  return useData(
    DnsRecordsForAZoneService.dnsRecordsForAZoneListDnsRecords,
    {
      zone_id: zoneId,
      page: pageIndex,
      per_page: perPage,
      ...(search ? { search } : {}),
      cacheTags: [DNS_CACHE_TAG]
    },
    { keepPreviousData: true }
  );
}

export function useUpdateCloudflareDNSRecord() {
  const zoneId = useZoneId();
  const { trigger: create, isMutating: isCreating } = useMutation(
    DnsRecordsForAZoneService.dnsRecordsForAZoneCreateDnsRecord
  );
  const { trigger: patch, isMutating: isPatching } = useMutation(
    DnsRecordsForAZoneService.dnsRecordsForAZonePatchDnsRecord
  );

  const trigger = useCallback(async (record: DnsRecordsDnsRecordPostWritable, isCreate: boolean, id?: string) => {
    try {
      if (isCreate) {
        await create({ zone_id: zoneId, dnsRecordsDnsRecordPostWritable: record });
      } else if (id) {
        await patch({ zone_id: zoneId, dns_record_id: id, dnsRecordsDnsRecordPatchWritable: record });
      }
      await unstable_mutateWithTags([DNS_CACHE_TAG]);
      return true;
    } catch {
      return false;
    }
  }, [zoneId, create, patch]);

  return { trigger, isMutating: isCreating || isPatching };
}

export function useDeleteCloudflareDNSRecord() {
  const zoneId = useZoneId();
  const { trigger: sdkTrigger, isMutating } = useMutation(
    DnsRecordsForAZoneService.dnsRecordsForAZoneDeleteDnsRecord
  );

  const trigger = useCallback(async (id: string) => {
    try {
      await sdkTrigger({ zone_id: zoneId, dns_record_id: id, body: {} });
      await unstable_mutateWithTags([DNS_CACHE_TAG]);
      return true;
    } catch {
      return false;
    }
  }, [zoneId, sdkTrigger]);

  return { trigger, isMutating };
}
