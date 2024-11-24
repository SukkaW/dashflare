import { Stack, Title, Text, Select } from '@mantine/core';
import type { SelectItem } from '@mantine/core';
import { useCloudflareAccounts } from '@/lib/cloudflare/accounts';
import { useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useCallback } from 'foxact/use-typescript-happy-callback';
import { useAccountId } from '@/hooks/use-params';

export default function DeleteOldPages() {
  const { data: accounts, isLoading } = useCloudflareAccounts();
  const accountId = useAccountId(true);
  const accountListData: SelectItem[] = useMemo(() => accounts?.flatMap(accountList => accountList.result.map(account => ({
    label: account.name,
    value: account.id
  }))) || [], [accounts]);
  const navigate = useNavigate();

  return (
    <Stack>
      <Title>Delete Old Pages</Title>
      <Text c="gray">
        Delete Stale Cloudflare Pages deployments (older than 45 days, keep least 20 rencent deployments).
      </Text>
      <Select
        disabled={isLoading}
        label="Choose your Cloudflare Account"
        data={accountListData}
        value={accountId}
        onChange={useCallback((value) => {
          navigate('/account/delete-old-pages' + (value ? ('/' + value) : ''));
        }, [navigate])}
      />
      <Outlet />
    </Stack>
  );
}
