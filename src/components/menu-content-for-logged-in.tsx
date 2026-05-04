import { Box, Menu, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import TokenViewer from './token-modal';
import { useLogout } from '@/context/token';
import { memo } from 'react';
import { useCloudflareApiRateLimit } from '@/lib/fetcher';
import { MenuContentPortalContent } from '@/context/menu-content-portal';

function CloudflareRateLimit() {
  const count = useCloudflareApiRateLimit();
  return (
    <span>{count} / 1200</span>
  );
}

export default memo(function MenuContentForLoggedIn() {
  const [opened, { open, close }] = useDisclosure();
  const logout = useLogout();

  return (
    <MenuContentPortalContent>
      <Menu.Label>Cloudflare API Rate Limit</Menu.Label>
      <Box px="xs" mb="xs">
        <Text size="sm">
          Requests in last 5 minutes: <CloudflareRateLimit />
        </Text>
        <Text size="xs" color="gray" maw={256}>
          The global rate limit for Cloudflare&apos;s API is 1200 requests per five minutes.
        </Text>
      </Box>

      <Menu.Label>Account</Menu.Label>
      <Menu.Item onClick={open}>View Token</Menu.Item>
      <Menu.Item color="red" onClick={logout}>Log Out</Menu.Item>

      <TokenViewer opened={opened} onClose={close} />
    </MenuContentPortalContent>
  );
});
