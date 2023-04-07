import useSWR from 'swr';
import { useToken } from '@/context/token';
import { useZoneId } from '../../hooks/use-zone-id';
import { fetcherWithAuthorizationAndPagination, handleFetchError } from '../fetcher';

declare global {
  namespace Cloudflare {
    export type ValidDNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'SRV' | 'LOC' | 'MX'
    | 'NS' | 'SPF' | 'CERT' | 'DNSKEY' | 'DS' | 'NAPTR' | 'SMIMEA' | 'SSHFP'
    | 'TLSA' | 'URI';

    export interface DNSRecord {
      // DNS record identifier tag
      id: string
      // Record type
      type: Cloudflare.ValidDNSRecordType
      // DNS record name
      name: string
      // A valid IPv4 address
      content: string
      // Whether the record can be proxied by Cloudflare or not
      proxiable: boolean
      // Whether the record is receiving the performance and security benefits of Cloudflare
      proxied: boolean
      // Time to live for DNS record. Value of 1 is 'automatic'
      ttl: number
      // Whether this record can be modified/deleted (true means it's managed by Cloudflare)
      locked: boolean
      // Zone identifier tag
      zoneId: string
      // The domain of the record
      zoneName: string
      // When the record was last modified
      /** @example '2018-03-01T14:47:53.403547Z' */
      modifiedOn: string
      // When the record was created
      /** @example '2018-03-01T14:47:53.403547Z' */
      createdOn: string,
      // Extra Cloudflare-specific information about the record
      meta: {
        // Will exist if Cloudflare automatically added this DNS record during initial setup.
        autoAdded: boolean,
        [key: string]: string | boolean
      }
    }
  }
}

export const useCloudflareListDNSRecords = (pageIndex: number, perPage = 20) => useSWR<Cloudflare.APIResponse<Cloudflare.DNSRecord[]>>(
  [`client/v4/zones/${useZoneId()}/dns_records`, useToken(), pageIndex, perPage],
  fetcherWithAuthorizationAndPagination,
  {
    onError(error) {
      handleFetchError(error, 'Failed to fetch DNS records.');
    }
  }
);
