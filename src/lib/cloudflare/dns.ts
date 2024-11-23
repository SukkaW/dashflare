import useSWR, { mutate } from 'swr';

import { useToken } from '@/context/token';
import { useZoneId } from '@/hooks/use-params';
import { fetcherWithAuthorization, fetcherWithAuthorizationAndPagination, handleFetchError } from '../fetcher';
import { useCallback, useState } from 'react';

export const cloudflareValidDNSRecordTypes = ['A', 'AAAA', 'CNAME', 'TXT', 'SRV', 'LOC', 'MX', 'NS', 'SPF', 'CERT', 'DNSKEY', 'DS', 'NAPTR', 'SMIMEA', 'SSHFP', 'TLSA', 'URI'] as const;

export const currentlySupportedCloudflareDNSRecordTypes = new Set<Cloudflare.ValidDNSRecordType>(['A', 'AAAA', 'CNAME', 'TXT', 'NS', 'SPF']);

declare global {
  namespace Cloudflare {
    export type ValidDNSRecordType = (typeof cloudflareValidDNSRecordTypes)[number];

    export interface DNSRecord<Extension = Record<string, string>> {
      // DNS record identifier tag
      id: string,
      // Record type
      type: ValidDNSRecordType,
      // DNS record name
      name: string,
      // A valid IPv4 address
      content: string,
      // Whether the record can be proxied by Cloudflare or not
      proxiable: boolean,
      // Whether the record is receiving the performance and security benefits of Cloudflare
      proxied: boolean,
      // Time to live for DNS record. Value of 1 is 'automatic'
      ttl: number,
      // Whether this record can be modified/deleted (true means it's managed by Cloudflare)
      locked: boolean,
      // Zone identifier tag
      zone_id: string,
      // The domain of the record
      zone_name: string,
      // When the record was last modified
      /** @example '2018-03-01T14:47:53.403547Z' */
      modified_on: string,
      // When the record was created
      /** @example '2018-03-01T14:47:53.403547Z' */
      created_on: string,
      // Extra Cloudflare-specific information about the record
      meta: {
        // Will exist if Cloudflare automatically added this DNS record during initial setup.
        autoAdded: boolean,
        [key: string]: string | boolean
      },
      priority?: number,
      data?: Extension
    }

    export type CreateDNSRecord = Pick<DNSRecord, 'name' | 'type' | 'content' | 'ttl' | 'proxied'>;
  }
}

export function useCloudflareListDNSRecords(pageIndex: number, perPage = 20, search = '') {
  return useSWR<Cloudflare.APIResponse<Cloudflare.DNSRecord[]>>(
    [
      `client/v4/zones/${useZoneId()}/dns_records${search ? `?search=${search}` : ''}`,
      useToken(),
      pageIndex,
      perPage
    ],
    fetcherWithAuthorizationAndPagination,
    {
      keepPreviousData: true,
      onError(error) {
        handleFetchError(error, 'Failed to fetch DNS records.');
      }
    }
  );
}

function mutateCloudflareDNSRecord(zoneId: string) {
  return mutate(
    (key) => Array.isArray(key) && typeof key[0] === 'string' && key[0].startsWith(`client/v4/zones/${zoneId}/dns_records`),
    undefined,
    { populateCache: false, revalidate: true, rollbackOnError: true }
  );
}

export function useUpdateCloudflareDNSRecord() {
  const [isMutating, setIsMutating] = useState(false);
  const zoneId = useZoneId();
  const token = useToken();

  const trigger = useCallback(async (record: Cloudflare.CreateDNSRecord, isCreate: boolean, id?: string) => {
    setIsMutating(true);

    try {
      if (!token) throw new Error('There is no token.');

      if (isCreate) {
        await fetcherWithAuthorization(
          [`client/v4/zones/${zoneId}/dns_records`, token],
          {
            method: 'POST',
            body: JSON.stringify(record)
          }
        );
      } else if (id) {
        await fetcherWithAuthorization(
          [`client/v4/zones/${zoneId}/dns_records/${id}`, token],
          {
            method: 'PATCH',
            body: JSON.stringify(record)
          }
        );
      }

      await mutateCloudflareDNSRecord(zoneId);
      setIsMutating(false);

      return true;
    } catch (e) {
      handleFetchError(
        e,
        isCreate
          ? 'Failed to create DNS record.'
          : 'Failed to update DNS record.'
      );
      setIsMutating(false);

      return false;
    }
  }, [token, zoneId]);

  return {
    trigger,
    isMutating
  };
}

export function useDeleteCloudflareDNSRecord() {
  const [isMutating, setIsMutating] = useState(false);
  const zoneId = useZoneId();
  const token = useToken();

  const trigger = useCallback(async (id: string) => {
    setIsMutating(true);

    try {
      if (!token) throw new Error('There is no token.');

      await fetcherWithAuthorization(
        [`client/v4/zones/${zoneId}/dns_records/${id}`, token],
        {
          method: 'DELETE'
        }
      );

      await mutateCloudflareDNSRecord(zoneId);
      setIsMutating(false);

      return true;
    } catch (e) {
      handleFetchError(
        e,
        'Failed to delete DNS record.'
      );
      setIsMutating(false);

      return false;
    }
  }, [token, zoneId]);

  return {
    trigger,
    isMutating
  };
}
