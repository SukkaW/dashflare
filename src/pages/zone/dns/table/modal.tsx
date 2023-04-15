import { modals } from '@mantine/modals';
import { Box, Button, Group, Input, NativeSelect, NumberInput, Stack, Switch, TextInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { currentlySupportedCloudflareDNSRecordTypes, useUpdateCloudflareDNSRecord, useDeleteCloudflareDNSRecord } from '@/lib/cloudflare/dns';
import { memo, useCallback, useMemo, useState } from 'react';

import { useStyles } from './table.styles';
import { IconCloudflare } from '@/components/icons/cloudflare';

interface DNSEditFormProps {
  record?: Cloudflare.DNSRecord | undefined | null,
  modalId: string
}

const SUPPORTED_DNS_RECORD_TYPES = Array.from(currentlySupportedCloudflareDNSRecordTypes);

const DNSEditForm = memo(({ record, modalId }: DNSEditFormProps) => {
  const isCreate = !record;
  const { trigger, isMutating } = useUpdateCloudflareDNSRecord();

  const { cx, classes } = useStyles();

  const form = useForm<Cloudflare.CreateDNSRecord>({
    initialValues: {
      type: record?.type ?? 'A',
      name: record?.name ?? '',
      content: record?.content ?? '',
      ttl: record?.ttl ?? 1,
      proxied: record?.proxied ?? false
    }
  });
  const [autoTtl, setAutoTtl] = useState(record?.ttl === 1);
  const handleAutoTtlChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    const isAutoTtl = event.currentTarget.checked;
    if (isAutoTtl) {
      form.setFieldValue('ttl', 1);
    }
    setAutoTtl(isAutoTtl);
  }, [form]);

  const handleReset: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
    form.onReset(e);
    modals.close(modalId);
  }, [form, modalId]);

  return (
    <Box w="100%">
      <form
        onSubmit={form.onSubmit(values => {
          trigger(values, isCreate, record?.id).then((result) => {
            if (result) {
              modals.close(modalId);
            }
          });
        })}
        onReset={handleReset}
      >
        <Stack>
          <NativeSelect
            label="Type"
            withAsterisk
            data={SUPPORTED_DNS_RECORD_TYPES}
            {...form.getInputProps('type')}
          />
          <TextInput
            label="Name"
            withAsterisk
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Value"
            withAsterisk
            {...form.getInputProps('content')}
          />
          <Group w="100%" grow>
            <NumberInput
              label="TTL"
              withAsterisk
              disabled={autoTtl}
              {...form.getInputProps('ttl')}
            />
            <Input.Wrapper required label="Auto TTL" withAsterisk>
              <Switch
                checked={autoTtl}
                onChange={handleAutoTtlChange}
              />
            </Input.Wrapper>
          </Group>
          <Input.Wrapper required label="Cloudflare CDN Proxy" withAsterisk>
            <Switch
              {...form.getInputProps('proxied', { type: 'checkbox' })}
              onLabel={<IconCloudflare
                width={20}
                height={20}
                className={cx(classes.proxiedIcon, classes.proxiedIconWhite)}
              />}
              offLabel={<IconCloudflare
                width={20}
                height={20}
                className={cx(classes.proxiedIcon, classes.proxiedIconInactive)}
              />}
              color="orange"
            />
          </Input.Wrapper>
          {
            useMemo(() => (
              <Group spacing="xs">
                <Button type="submit" loading={isMutating}>
                  Save
                </Button>
                <Button type="reset" variant="outline">
                  Cancel
                </Button>
              </Group>
            ), [isMutating])
          }
        </Stack>
      </form>
    </Box>
  );
});

const DNSModal = memo(({ record, modalId }: DNSEditFormProps) => {
  if (record && record.type && !currentlySupportedCloudflareDNSRecordTypes.has(record.type)) {
    return (
      <Stack>
        <Text>
          Dashflare does not currently support creating or editing DNS records of type {record.type} yet!
        </Text>
        <Button onClick={() => modals.close(modalId)}>
          Close
        </Button>
      </Stack>
    );
  }

  return (
    <DNSEditForm record={record} modalId={modalId} />
  );
});

export const openEditDNSRecordModal = (record?: Cloudflare.DNSRecord) => {
  const modalId = `dns-record-modal-${record?.id ?? 'create'}`;

  return modals.open({
    centered: true,
    modalId,
    title: record ? 'Edit DNS Record' : 'Add DNS Record',
    children: (
      <DNSModal record={record} modalId={modalId} />
    )
  });
};

const DeleteDNSRecordModal = memo(({ recordId, recordName, modalId }: { recordId: string, recordName: string, modalId: string }) => {
  const { trigger, isMutating } = useDeleteCloudflareDNSRecord();

  const handleCancel = () => {
    modals.close(modalId);
  };

  const handleConfirm = async () => {
    trigger(recordId);
    modals.close(modalId);
  };

  return (
    <Stack>
      <Text size="sm">
        Are you sure you want to delete your DNS record of {recordName}? This action is destructive and you will have
        to contact support to restore your data.
      </Text>

      <Group position="right">
        <Button loading={isMutating} variant="default" onClick={handleCancel}>
          Cancel
        </Button>

        <Button loading={isMutating} color="red" onClick={handleConfirm}>
          Confirm and Delete
        </Button>
      </Group>
    </Stack>
  );
});

export const openDeleteDNSRecordModal = (recordId: string, recordName: string) => {
  const modalId = `dns-delete-record-modal-${recordId}`;

  return modals.open({
    modalId,
    title: 'Delete DNS Record',
    centered: true,
    children: (
      <DeleteDNSRecordModal recordId={recordId} recordName={recordName} modalId={modalId} />
    )
  });
};
