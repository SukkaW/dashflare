import { Card, Group, Select, Pagination, rem, Loader, Button, TextInput, Flex, Center, Text } from '@mantine/core';
import { useCloudflareListDNSRecords } from '@/lib/cloudflare/dns';
import { useMemo } from 'react';

import DNSDataTable from './table';
import { IconSearch } from '@tabler/icons-react';
import { useUncontrolled } from 'foxact/use-uncontrolled';
import { openEditDNSRecordModal } from './modal';
import { PAGE_SIZE_ARRAY } from '@/lib/constants';
import { usePagination } from '@/hooks/use-pagination';

export default function DNSDataTableEntry() {
  // DNS Record Search
  const [searchQuery, handleCommitSearchQuery, searchInputRef] = useUncontrolled('');

  const { pagination, handlePageIndexChange, handlePageSizeChange } = usePagination({
    pageIndex: 1,
    pageSize: 20
  });

  const { data, isLoading } = useCloudflareListDNSRecords(pagination.pageIndex, pagination.pageSize, searchQuery);
  const searchQueryInputShowLoading = isLoading && searchQuery;
  const pageCount = data?.result_info?.total_pages ?? -1;

  return (
    <Card withBorder shadow="lg" p={0}>
      {useMemo(() => (
        <Flex p={16} justify="space-between">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCommitSearchQuery();
          }}>
            <Group>
              <TextInput
                ref={searchInputRef}
                placeholder="Search records..."
                icon={
                  searchQueryInputShowLoading
                    ? <Loader size="xs" />
                    : <IconSearch size={rem(16)} />
                }
              />
              <Button type="submit">Search</Button>
            </Group>
          </form>
          <Button onClick={() => openEditDNSRecordModal()}>Create DNS Record</Button>
        </Flex>
      ), [handleCommitSearchQuery, searchInputRef, searchQueryInputShowLoading])}
      {
        useMemo(() => {
          if (!data) {
            return (
              <Center h={288}>
                <Loader />
              </Center>
            );
          }

          if (data.result?.length === 0) {
            return (
              <Center h={288}>
                <Text>There is no DNS records</Text>
              </Center>
            );
          }

          return (
            <DNSDataTable
              data={data.result}
              pageCount={pageCount}
              pagination={pagination}
            />
          );
        }, [data, pageCount, pagination])
      }
      <Group p={16}>
        <Pagination
          total={pageCount}
          value={pagination.pageIndex}
          onChange={handlePageIndexChange}
        />
        <Select
          size="sm"
          styles={{
            input: {
              height: 32,
              minHeight: 32
            }
          }}
          w={128}
          data={PAGE_SIZE_ARRAY}
          value={String(pagination.pageSize)}
          onChange={handlePageSizeChange}
        />
      </Group>
    </Card>
  );
}
