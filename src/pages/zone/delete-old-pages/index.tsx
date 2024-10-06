import { Stack, Title, Text } from '@mantine/core';
import { useCloudflareAccounts } from '@/lib/cloudflare/accounts';

export default function DeleteOldPages() {
  return (
    <Stack>
      <Title>Delete Old Pages</Title>
      <Text c="gray">
        Delete old Cloudflare Pages deployments.
      </Text>
      {JSON.stringify(useCloudflareAccounts().data)}
    </Stack>
  );
}
