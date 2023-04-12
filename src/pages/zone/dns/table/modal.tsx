import { modals } from '@mantine/modals';
import { Box, Button, Group, Input, NativeSelect, NumberInput, Stack, Switch, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { cloudflareValidDNSRecordTypes } from '@/lib/cloudflare/dns';
import { memo, useCallback, useState } from 'react';

interface DNSEditFormProps {
  record?: Cloudflare.DNSRecord
}

const DNSEditForm = memo(({ record }: DNSEditFormProps) => {
  const form = useForm<Partial<Cloudflare.DNSRecord>>({
    initialValues: {
      type: record?.type ?? 'A',
      name: record?.name ?? '',
      content: record?.content ?? '',
      ttl: record?.ttl ?? 1
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

  return (
    <Box w="100%">
      <form onSubmit={form.onSubmit(values => {
        console.log(values);
      })}>
        <Stack>
          <NativeSelect
            label="Type"
            withAsterisk
            data={cloudflareValidDNSRecordTypes as unknown as string[]}
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
          <Button type="submit">
            Submit
          </Button>
        </Stack>
      </form>

    </Box>
  );
});

export const openDNSRecordModal = (record?: Cloudflare.DNSRecord) => {
  return modals.open({
    centered: true,
    title: record ? 'Edit DNS Record' : 'Add DNS Record',
    children: (
      <DNSEditForm record={record} />
    )
  });
};
