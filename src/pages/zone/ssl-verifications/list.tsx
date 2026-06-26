import { Stack, Skeleton, Accordion, Text, Code } from '@mantine/core';
import { useCloudflareSSLVerificationLists } from '@/lib/cloudflare/ssl-verification';
import { createFixedArray } from 'foxact/create-fixed-array';
import { SSLVerificationItem } from './item';
import { extractErrorMessage } from '@/lib/fetcher';

export function SSLVerificationsList() {
  const { data, error, isLoading } = useCloudflareSSLVerificationLists();

  if (error) {
    return (
      <>
        <Text color="red" fw={600}>
          Failed to load the SSL verifications list:
        </Text>
        <Code block>
          {
            extractErrorMessage(error)
          }
        </Code>
      </>
    );
  }
  if (isLoading) {
    return (
      <Stack>
        {createFixedArray(6).map(i => (
          <Skeleton key={i} h={48} w="100%" />
        ))}
      </Stack>
    );
  }

  return (
    <Accordion variant="separated">
      {data?.result.map(item => (
        <SSLVerificationItem
          key={item.cert_pack_uuid || item.hostname}
          {...item}
        />
      ))}
    </Accordion>
  );
}
