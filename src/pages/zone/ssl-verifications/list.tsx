import { Stack, Skeleton, Accordion, Text, Code } from '@mantine/core';
import { useCloudflareSSLVerificationLists } from '@/lib/cloudflare/ssl-verification';
import { createArray } from '@/lib/create-array';
import { SSLVerificationItem } from './item';
import { HTTPError } from '@/lib/fetcher';
import { isCloudflareAPIResponseError } from '@/lib/cloudflare/types';

export const SSLVerificationsList = () => {
  const { data, error, isLoading } = useCloudflareSSLVerificationLists();

  if (error) {
    return (
      <>
        <Text color="red" fw={600}>
          Failed to load the SSL verifications list:
        </Text>
        <Code block>
          {// eslint-disable-next-line no-nested-ternary -- this is fine
            error instanceof HTTPError
              ? isCloudflareAPIResponseError(error.data)
                ? error.data.errors.map(e => e.message).join('\n')
                : JSON.stringify(error.data, null, 2)
              : 'message' in error
                ? error.message
                : JSON.stringify(error, null, 2)
          }
        </Code>
      </>
    );
  }
  if (isLoading) {
    return (
      <Stack>
        {createArray(6).map(i => (
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
};
