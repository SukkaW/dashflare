import { Stack, Skeleton, Accordion, Text } from '@mantine/core';
import { useCloudflareSSLVerificationLists } from '@/lib/cloudflare/ssl-verification';
import { createArray } from '@/lib/create-array';
import { SSLVerificationItem } from './item';

export const SSLVerificationsList = () => {
  const { data, error, isLoading } = useCloudflareSSLVerificationLists();

  if (error) {
    return (
      <Text color="red" fw={600}>
        Failed to load the SSL verifications list
      </Text>
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
