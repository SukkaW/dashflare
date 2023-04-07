import { Stack, Title } from '@mantine/core';
import DNSDataTable from './table';

export default function DNSPage() {
  return (
    <Stack>
      <Title>DNS Settings</Title>
      <DNSDataTable />
    </Stack>
  );
}
