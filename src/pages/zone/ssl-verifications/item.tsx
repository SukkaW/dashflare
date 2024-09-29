import { Badge, Accordion, Group, NativeSelect, Text, Divider, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { memo, useMemo, useState } from 'react';
import { updateCloudflareSSLVerification, useCloudflareSSLVerificationLists } from '@/lib/cloudflare/ssl-verification';
import { handleFetchError } from '@/lib/fetcher';
import { useToken } from '@/context/token';
import { useZoneId } from '@/hooks/use-zone-id';
import CodeBlock from '@/components/code-block';
import title from 'title';

interface ControlProps {
  hostname: string,
  certificate_status: Cloudflare.CertificateStatus['certificate_status'],
  validation_method: Cloudflare.CertificateStatus['validation_method']
}

const Control = memo(({
  hostname,
  certificate_status,
  validation_method
}: ControlProps) => {
  const badge = useMemo(() => {
    switch (certificate_status) {
      case 'active':
        return <Badge variant="filled" color="green" sx={{ flex: 'none' }}>Active</Badge>;
      case 'pending_validation':
        return <Badge variant="filled" color="yellow" sx={{ flex: 'none' }}>Pending ({validation_method})</Badge>;
      case 'expired':
        return <Badge variant="filled" color="red" sx={{ flex: 'none' }}>Expired</Badge>;
      default:
        return <Badge variant="filled" color="blue" sx={{ flex: 'none' }}>{certificate_status}</Badge>;
    }
  }, [certificate_status, validation_method]);

  return (
    <Group>
      <Text sx={{ flexGrow: 1 }}>
        {hostname}
      </Text>
      {badge}
    </Group>
  );
});

interface FormProps {
  cert_pack_uuid: Cloudflare.CertificateStatus['cert_pack_uuid'],
  initial_validation_method: Cloudflare.CertificateStatus['validation_method']
}

const Form = ({
  cert_pack_uuid,
  initial_validation_method
}: FormProps) => {
  const { mutate } = useCloudflareSSLVerificationLists();
  const [isMutating, setIsMutating] = useState(false);
  const token = useToken();
  const zoneId = useZoneId();

  const form = useForm<{
    validation_method: Cloudflare.CertificateStatus['validation_method']
  }>({
    initialValues: {
      validation_method: initial_validation_method
    }
  });

  return (
    <form
      onSubmit={form.onSubmit(async values => {
        setIsMutating(true);
        try {
          if (!token) {
            throw new TypeError('Missing API token');
          }
          await updateCloudflareSSLVerification(
            token,
            zoneId,
            cert_pack_uuid,
            values.validation_method
          );
          mutate();
        } catch (e) {
          handleFetchError(e);
        } finally {
          setIsMutating(false);
        }
      })}
    >
      <Group align="flex-start">
        <NativeSelect
          size="sm"
          label="Validation Method"
          data={[
            { label: 'HTTP', value: 'http' },
            { label: 'CNAME', value: 'cname' },
            { label: 'TXT', value: 'txt' }
          ]}
          {...form.getInputProps('validation_method')}
        />
        <Button type="submit" mt="auto" h={36} mb={0.5} loading={isMutating}>
          Submit
        </Button>
      </Group>
    </form>
  );
};

interface VerificationInfoProps {
  http_url?: string,
  http_body?: string,
  cname_target?: string,
  cname?: string,
  txt_name?: string,
  txt_value?: string,
  status?: string
}

const VerificationInfo = memo(({
  http_url,
  http_body,
  cname_target,
  cname,
  txt_name,
  txt_value,
  status
}: VerificationInfoProps) => (
  <Stack>
    {txt_name && (
      <>
        <Text fz={14} fw={600}>Certificate validation TXT Record</Text>
        <CodeBlock>{txt_name}</CodeBlock>
      </>
    )}
    {txt_value && (
      <>
        <Text fz={14} fw={600}>Certificate validation TXT Value</Text>
        <CodeBlock>{txt_value}</CodeBlock>
      </>
    )}
    {
      http_url && (
        <>
          <Text fz={14} fw={600}>Certificate validation HTTP Request</Text>
          <CodeBlock>{http_url}</CodeBlock>
        </>
      )
    }
    {
      http_body && (
        <>
          <Text fz={14} fw={600}>Certificate validation HTTP Response</Text>
          <CodeBlock>{http_body}</CodeBlock>
        </>
      )
    }
    {
      cname && (
        <>
          <Text fz={14} fw={600}>Certificate validation CNAME Record</Text>
          <CodeBlock>{cname}</CodeBlock>
        </>
      )
    }
    {
      cname_target && (
        <>
          <Text fz={14} fw={600}>Certificate validation CNAME Target</Text>
          <CodeBlock>{cname_target}</CodeBlock>
        </>
      )
    }
    {
      status && (
        <Group>
          <Text fz={14} fw={600}>Certificate validation Status</Text>
          <Text>{title(status)}</Text>
        </Group>
      )
    }
  </Stack>
));

const createKeyFromVerificationInfo = (verification_info: VerificationInfoProps, index: number) => (Object.entries(verification_info)
  .filter(v => v[1] !== undefined)
  .map(([key, value]) => `${key}=${value}`)
  .join('&') + index);

export const SSLVerificationItem = memo(({
  cert_pack_uuid,
  hostname,
  certificate_status,
  validation_method,
  verification_info,
  validation_type
}: Cloudflare.CertificateStatus) => (
  <Accordion.Item value={cert_pack_uuid || hostname}>
    <Accordion.Control py="xs">
      <Control hostname={hostname} certificate_status={certificate_status} validation_method={validation_method} />
    </Accordion.Control>
    <Accordion.Panel>
      {
        certificate_status === 'active'
          ? (
            <Stack>
              <Group>
                <Text fw={600}>Validation Method</Text>
                <Text>{validation_method.toUpperCase()}</Text>
              </Group>
              {validation_type && (
                <Group>
                  <Text fw={600}>Validation Type</Text>
                  <Text>{validation_type.toUpperCase()}</Text>
                </Group>
              )}
            </Stack>
          )
          : (
            <Form
              cert_pack_uuid={cert_pack_uuid}
              initial_validation_method={validation_method}
            />
          )
      }
      {verification_info && <Divider label="Verification Details" labelPosition="center" />}
      {verification_info && (
        Array.isArray(verification_info)
          ? verification_info.map((info, i) => (
            <VerificationInfo key={createKeyFromVerificationInfo(info, i)} {...info} />
          ))
          : <VerificationInfo {...verification_info} />
      )}
    </Accordion.Panel>
  </Accordion.Item>
));
