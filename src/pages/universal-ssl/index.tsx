import { updateCloudflareUniversalSSLSettings, useCloudflareUniversalSSLSettings } from '@/lib/cloudflare/universal-ssl-settings';
import { Anchor, Button, Card, Group, NativeSelect, Stack, Switch, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';

import useSWRMutation from 'swr/mutation';
import { useZoneId } from '../../hooks/use-zone-id';
import { useToken } from '../../provider/token';
import { handleFetchError } from '../../lib/fetcher';

export default function UniversalSSLPage() {
  const { data, isLoading } = useCloudflareUniversalSSLSettings();
  const { trigger, isMutating } = useSWRMutation(
    [`client/v4/zones/${useZoneId()}/ssl/universal/settings`, useToken()],
    updateCloudflareUniversalSSLSettings,
    {
      throwOnError: false,
      revalidate: false,
      onError(e) {
        handleFetchError(e, 'Failed to update Universal SSL settings');
      }
    }
  );
  const shouldDisableInput = isLoading || isMutating;

  const form = useForm<Cloudflare.UniversalSSLSettings>({
    initialValues: {
      enabled: data?.result?.enabled ?? true,
      certificate_authority: data?.result?.certificate_authority || 'lets_encrypt'
    },
    validateInputOnBlur: true
  });

  if (data && data.result) {
    if (!form.isTouched('enabled')) {
      form.setFieldValue('enabled', data.result.enabled);
    }
    if (!form.isTouched('certificate_authority')) {
      form.setFieldValue('certificate_authority', data.result.certificate_authority);
    }
  }

  return (
    <Stack>
      <Title>Universal SSL</Title>
      <Card withBorder shadow="md" maw={600}>
        <form onSubmit={form.onSubmit((value) => { trigger(value); })}>
          <Stack>
            <Switch
              label="Enable Universal SSL"
              disabled={shouldDisableInput}
              {...form.getInputProps('enabled', { type: 'checkbox' })}
            />
            <NativeSelect
              label="Select CA"
              data={
                isLoading
                  ? ['Loading...']
                  : [
                    { value: 'lets_encrypt', label: 'Let\'s Encrypt' },
                    { value: 'google', label: 'Google GTS' },
                    { value: 'digicert', label: 'DigiCert (Deprecated)', disabled: true }
                  ]
              }
              disabled={shouldDisableInput}
              {...form.getInputProps('certificate_authority')}
            />
            <Group position="right" mt="md">
              <Button type="submit" disabled={isLoading} loading={isMutating}>Submit</Button>
            </Group>
            <Text color="gray" size="xs">
              Let&apos;s Encrypt does support ECC (ECDSA) certificates, and Cloudflare will issue both ECC & RSA for maximum performance and compatibility if you have a Pro or higher plan. But it might not be compatible with some old devices (
              <Anchor href="https://letsencrypt.org/docs/certificate-compatibility/" target="_blank">Let&apos;s Encrypt Certificate Compatibility</Anchor>
              ).
            </Text>
            <Text color="gray" size="xs">
              Google GTS does not support ECC (ECDSA) certificates, but it is compatible with nearly all existing devices, and its OCSP server has PoPs inside the Mainland China (while the OCSP server did being blocked by the China GFW before).
            </Text>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
