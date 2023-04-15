import type { SelectItem } from '@mantine/core';
import { Card, Group, Select, Pagination, ScrollArea, rem, Loader, Button, TextInput, Flex } from '@mantine/core';
import type { PaginationState } from '@tanstack/react-table';
import { useCloudflareListDNSRecords } from '@/lib/cloudflare/dns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import DNSDataTable from './table';
import { IconSearch } from '@tabler/icons-react';
import { useUncontrolled } from '@/hooks/use-uncontrolled';
import { openEditDNSRecordModal } from './modal';

const PAGE_SIZE_ARRAY: SelectItem[] = [
  { label: '20 / page', value: '20' },
  { label: '30 / page', value: '30' },
  { label: '50 / page', value: '50' },
  { label: '100 / page', value: '100' }
];

export default function DNSDataTableEntry() {
  // DNS Record Search
  const [searchQuery, handleCommitSearchQuery, searchInputRef] = useUncontrolled('');

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20
  });
  const { data, isLoading } = useCloudflareListDNSRecords(pagination.pageIndex, pagination.pageSize, searchQuery);
  const searchQueryInputShowLoading = isLoading && searchQuery;
  const pageCount = data?.result_info?.total_pages ?? -1;

  const tableElementRef = useRef<HTMLTableElement>(null);
  const containerElementRef = useRef<HTMLDivElement>(null);
  const containerViewportRef = useRef<HTMLDivElement>(null);

  const [isRightColumnFixed, setIsRightColumnFixed] = useState(false);
  const [isReachRightEndOfScrollArea, setReachRightEndOfScrollArea] = useState(false);
  useEffect(() => {
    const containerElement = containerElementRef.current;
    const tableElement = tableElementRef.current;
    const observer = new ResizeObserver((entries) => {
      if (tableElement && containerElement) {
        const containerWidth = entries[0].contentRect.width;
        const tableElementWidth = tableElement.getBoundingClientRect().width;
        const isRightColumnFixed = containerWidth < tableElementWidth;

        setIsRightColumnFixed(isRightColumnFixed);
      }
    });

    if (containerElement) {
      observer.observe(containerElement);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleScrollAreaPositionChange = useCallback((position: {
    x: number;
    y: number;
  }) => {
    const containerElement = containerViewportRef.current;
    if (containerElement) {
      setReachRightEndOfScrollArea(
        containerElement.getBoundingClientRect().width + position.x + 1 >= containerElement.scrollWidth
      );
    }
  }, []);

  const handlePageIndexChange = useCallback((pageIndex: number) => setPagination(p => ({
    ...p,
    pageIndex
  })), []);
  const handlePageSizeChange = useCallback((pageSize: string | null) => setPagination(p => ({
    ...p,
    pageSize: Number(pageSize)
  })), []);

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

      <ScrollArea
        sx={{
          maxWidth: '100%',
          overflowX: 'scroll',
          overflowY: 'hidden'
        }}
        styles={{
          scrollbar: {
            zIndex: 100
          }
        }}
        ref={containerElementRef}
        viewportRef={containerViewportRef}
        onScrollPositionChange={handleScrollAreaPositionChange}
      // offsetScrollbars
      // type="always"
      >
        <DNSDataTable
          ref={tableElementRef}
          data={data?.result}
          pageCount={pageCount}
          pagination={pagination}
          isRightColumnFixed={isRightColumnFixed}
          isReachRightEndOfScrollArea={isReachRightEndOfScrollArea}
        />
      </ScrollArea>
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
