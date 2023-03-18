import { Box, Stack, Title } from '@mantine/core';
import UniversalSSL from './universal-ssl';
// import { DataTable } from 'mantine-datatable';

export default function SSLPage() {
  return (
    <Box>
      <Stack>
        <Title>Universal SSL Settings</Title>
        <UniversalSSL />
        <Title>Edge Certificates</Title>
      </Stack>
    </Box>
  );
}
