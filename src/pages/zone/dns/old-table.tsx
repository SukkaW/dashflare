import type { DataTableColumn, DataTableRowExpansionProps } from 'mantine-datatable';
import { DataTable } from 'mantine-datatable';
import { memo, useCallback, useState } from 'react';
import { useCloudflareListDNSRecords } from '@/lib/cloudflare/dns';
import { Box, Flex, Text, rem, useMantineTheme } from '@mantine/core';
import { IconCloudflare } from '@/components/icons/cloudflare';
// import { IconChevronDown } from '@tabler/icons-react';
// import { IconEdit, IconTrash } from '@tabler/icons-react';

interface ExpandTableRowProps {
  record: Cloudflare.DNSRecord;
  recordIndex: number;
  collapse: () => void;
}

const ExpandTableRow = memo(({
  record
}: ExpandTableRowProps) => {
  return (
    <Box p="sm">
      <Text sx={{ wordBreak: 'break-all' }}>
        {JSON.stringify(record)}
      </Text>
    </Box>
  );
});

const Proxied = memo(({ proxied }: Cloudflare.DNSRecord) => {
  const theme = useMantineTheme();
  return (
    <Flex align="center">
      <IconCloudflare
        width={20}
        height={20}
        style={{
          width: 20, height: 20,
          color: proxied ? theme.colors.orange[6] : theme.colors.gray[6]
        }}
      />
    </Flex>
  );
});

const columns: DataTableColumn<Cloudflare.DNSRecord>[] = [
  { accessor: 'name', title: 'Name', width: 100, ellipsis: true },
  { accessor: 'type', title: 'Type', width: 56, noWrap: true },
  { accessor: 'content', title: 'Value', width: 100, ellipsis: true },
  {
    accessor: 'ttl', title: 'TTL', width: 44, noWrap: true,
    render(record) { return record.ttl === 1 ? 'Auto' : record.ttl; }
  },
  { accessor: 'proxied', title: 'CDN', width: 32, noWrap: true, render(props) { return <Proxied {...props} />; } }
];
const rowExpansion: DataTableRowExpansionProps<Cloudflare.DNSRecord> = {
  allowMultiple: true,
  // trigger: 'never',
  // eslint-disable-next-line react/no-unstable-nested-components -- this is only a render function
  content(props) { return <ExpandTableRow {...props} />; },
  collapseProps: {
    transitionDuration: 250
  }
};

export default function DNSDataTable() {
  const [page, setPage] = useState(1);
  const handlePageChange = useCallback((p: number) => setPage(p), []);

  const [perPage, setPerPage] = useState(20);
  const handlePerPageChange = useCallback((p: number) => setPerPage(p), []);

  const { data, isLoading } = useCloudflareListDNSRecords(page, perPage);

  return (
    <DataTable
      withBorder
      shadow="sm"
      fetching={isLoading}
      verticalSpacing="xs"
      sx={{
        padding: `${rem(8)} ${rem(16)}`
      }}
      records={data?.success ? data.result : []}
      columns={columns}
      rowExpansion={rowExpansion}
      totalRecords={data?.result_info?.total_count || 0}
      recordsPerPage={perPage}
      recordsPerPageOptions={[20, 50, 100]}
      onRecordsPerPageChange={handlePerPageChange}
      page={page}
      onPageChange={handlePageChange}
    // uncomment the next line to use a custom loading text
    // loadingText="Loading..."
    // uncomment the next line to display a custom text when no records were found
    // noRecordsText="No records found"
    // uncomment the next line to use a custom pagination text
    // paginationText={({ from, to, totalRecords }) => `Records ${from} - ${to} of ${totalRecords}`}
    // uncomment the next line to use a custom pagination color (see https://mantine.dev/theming/colors/)
    // paginationColor="grape"
    // uncomment the next line to use a custom pagination size
    // paginationSize="md"
    />
  );
}
