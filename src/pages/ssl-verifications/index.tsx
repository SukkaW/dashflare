import { Stack, Title } from '@mantine/core';
import { SSLVerificationsList } from './list';
import { ChangeAllToHttp } from './change-all';

export default function SSLVerificationsPage() {
  return (
    <Stack>
      <Title>Edge Certificates</Title>
      <ChangeAllToHttp />
      <SSLVerificationsList />
    </Stack>
  );
}
