import { Button, Card, Code, Stack, Text } from '@mantine/core';
import { useArray } from 'foxact/use-array';
import { useCallback, useMemo, useState } from 'react';
import { handleFetchError } from '@/lib/fetcher';
import { updateCloudflareSSLVerification, useCloudflareSSLVerificationLists } from '@/lib/cloudflare/ssl-verification';
import { notifications } from '@mantine/notifications';
import { useToken } from '@/context/token';
import { useZoneId } from '@/hooks/use-params';
import { wait } from '@/lib/wait';

export const ChangeAllToHttp = () => {
  const { data, isLoading, mutate } = useCloudflareSSLVerificationLists();
  const nonHttpPendingCertificates = useMemo(() => data?.result.filter((cert) => cert.validation_method !== 'http' && cert.certificate_status === 'pending_validation') ?? [], [data]);
  const [logs, pushLog, clearLog] = useArray<string>(() => (nonHttpPendingCertificates.length === 0
    ? ['This is where log outpus', 'There is no pending certificates, or all pending certificates are already using HTTP as validation method!']
    : ['This is where log outpus']));

  const token = useToken();
  const zoneId = useZoneId();

  const [isMutating, setIsMutating] = useState(false);
  const handleChange = useCallback(async () => {
    const tasks = nonHttpPendingCertificates.slice();
    setIsMutating(true);
    try {
      if (!token) {
        pushLog('Missing API Token!');
        notifications.show({
          color: 'red',
          message: 'Missing API Token!'
        });
        return;
      }

      if (tasks.length === 0) {
        pushLog('All pending certificates are already using HTTP as validation method!');
        notifications.show({
          color: 'red',
          message: 'All pending certificates are already using HTTP as validation method!'
        });
        return;
      }

      clearLog();
      pushLog(`Changing ${tasks.length} certificates to HTTP...`);

      let i = tasks.length;
      for (const task of tasks) {
        if (task.validation_method === 'http') {
          i--;
          continue;
        }
        if (task.certificate_status !== 'pending_validation') {
          i--;
          continue;
        }

        pushLog(`Changing validation method for [${task.hostname}] (${i}/${tasks.length})...`);
        // eslint-disable-next-line no-await-in-loop -- do this one by one
        const resp = await updateCloudflareSSLVerification(
          token,
          zoneId,
          task.cert_pack_uuid,
          'http'
        );
        i--;
        pushLog(`Validation method for [${task.hostname}] is changed to [${resp.result.validation_method}]!`);
        if (i === 0) {
          mutate();
        } else {
          pushLog(`Wait 30 seconds before continue. Remaining: ${i}/${tasks.length}`);
          // eslint-disable-next-line no-await-in-loop -- do this one by one
          await wait(5 * 1000);
          mutate();
          // eslint-disable-next-line no-await-in-loop -- do this one by one
          await wait(25 * 1000);
        }

        pushLog('Done!');
      }
    } catch (e) {
      pushLog('Failed to change all certificates\' validation method to HTTP!');
      handleFetchError(e);
    } finally {
      setIsMutating(false);
    }
  }, [clearLog, mutate, nonHttpPendingCertificates, pushLog, token, zoneId]);

  return (
    <Card withBorder shadow="sm">
      <Stack spacing="xs">
        <Text fw={600}>Change all to HTTP</Text>
        <Text size="sm" color="gray">
          This will set the verification method for all <Text component="span" fw={600}>Pending</Text> certificates to HTTP.
        </Text>
        <Button
          loading={isMutating}
          disabled={isLoading || nonHttpPendingCertificates.length === 0}
          onClick={handleChange}
        >
          Change
        </Button>
        <Code
          block
          h={100}
          mah={100}
          lh={1.7}
          sx={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
          ref={(el) => {
            if (el) {
              el.scrollTop = el.scrollHeight;
            }
          }}
        >
          {useMemo(() => logs.map(i => `* ${i}`).join('\n'), [logs])}
        </Code>
      </Stack>
    </Card>
  );
};
