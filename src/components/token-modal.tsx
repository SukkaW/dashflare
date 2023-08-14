import { Alert, Badge, Button, Modal, Skeleton, Stack, Table, Text } from '@mantine/core';
import { memo, useCallback, useMemo } from 'react';
import { useLogout, useToken } from '../context/token';
import CodeBlock from './code-block';
import { useCloudflareApiTokenStatus } from '../lib/cloudflare/token-status';

interface TokenModalProps {
  opened: boolean,
  onClose: () => void
}

const TokenViewer = memo(({ opened, onClose }: TokenModalProps) => {
  const token = useToken();
  const { data: tokenStatusData, isLoading } = useCloudflareApiTokenStatus(token);
  const logout = useLogout();

  const badgeColor = useMemo(() => {
    if (!tokenStatusData?.result) {
      return 'gray';
    }
    if (tokenStatusData.result.status === 'active') {
      return 'green';
    }
    return 'red';
  }, [tokenStatusData]);

  const showNotBefore = useMemo(() => tokenStatusData?.result && 'not_before' in tokenStatusData.result, [tokenStatusData]);

  return (
    <Modal opened={opened} onClose={onClose} title="Cloudflare API Token" centered>
      <Stack>
        <CodeBlock>{token || 'N/A'}</CodeBlock>
        {isLoading && <Skeleton />}
        <Table>
          <tbody>
            <tr>
              <td><Text fw={600}>Status</Text></td>
              <td>
                <Badge color={badgeColor}>
                  {tokenStatusData?.result.status}
                </Badge>
              </td>
            </tr>
            <tr>
              <td><Text fw={600}>{showNotBefore ? 'Not Before' : 'Expires On'}</Text></td>
              <td>
                {showNotBefore ? tokenStatusData?.result.not_before : tokenStatusData?.result.expires_on}
              </td>
            </tr>
          </tbody>
        </Table>
        <Button
          onClick={useCallback(() => {
            logout();
            onClose();
          }, [logout, onClose])}
          color="red"
          variant="outline"
        >
          Log Out
        </Button>
        <Alert color="gray" title="Note">
          The token is stored in your browser locally and will only be sent to Cloudflare&apos;s API server directly. You can delete the the token from your browser by clicking the <Text component="span" fw={600}>Log Out</Text> button.
        </Alert>
      </Stack>
    </Modal>
  );
});

export default TokenViewer;
