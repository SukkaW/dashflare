import { Box, Button, Card, Group, NativeSelect, Pagination, ScrollArea, Table, Text, createStyles, rem } from '@mantine/core';
import { IconCloudflare } from '@/components/icons/cloudflare';
import type { PaginationState } from '@tanstack/react-table';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useCloudflareListDNSRecords } from '@/lib/cloudflare/dns';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

const columnHelper = createColumnHelper<Cloudflare.DNSRecord>();
const EMPTY_ARRAY: Cloudflare.DNSRecord[] = [];

const useStyles = createStyles(theme => ({
  proxiedIcon: {
    width: 20,
    height: 20
  },
  proxiedIconActive: {
    color: theme.colors.orange[6]
  },
  proxiedIconInactive: {
    color: theme.colors.gray[6]
  },
  cellBg: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white
  },
  fixedRightColumn: {
    right: 0,
    // marginLeft: 2,
    position: 'sticky',
    zIndex: 100,
    '::before': {
      content: '""',
      overflow: 'hidden',
      pointerEvents: 'none',
      touchAction: 'none',
      userSelect: 'none',
      position: 'absolute',
      width: 10,
      left: -10,
      top: 0,
      height: '100%'
    }
  },
  fixedRightColumnActive: {
    borderLeftWidth: rem(1),
    borderLeftStyle: 'solid',
    borderLeftColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : 'transparent',
    '::before': {
      boxShadow: 'inset -10px 0 12px -10px rgba(0, 0, 0, .15)'
    }
  }
}));

const ProxiedCell = memo(({ proxied }: Pick<Cloudflare.DNSRecord, 'proxied'>) => {
  const { cx, classes } = useStyles();
  return (
    <Group noWrap align="center" spacing="xs" sx={{ userSelect: 'none' }}>
      <IconCloudflare
        width={20}
        height={20}
        className={cx(classes.proxiedIcon, proxied ? classes.proxiedIconActive : classes.proxiedIconInactive)}
      />
      {proxied ? 'Proxied' : 'DNS Only'}
    </Group>
  );
});

const ActionCell = memo(() => {
  return (
    <Group align="center" spacing={0} noWrap>
      <Button compact variant="subtle">
        Edit
      </Button>
      <Button compact variant="subtle" color="red">
        Delete
      </Button>
    </Group>
  );
});

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell(props) {
      return <Text truncate>{props.getValue()}</Text>;
    }
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    cell(props) {
      return props.getValue();
    },
    size: 48,
    minSize: 48,
    maxSize: 56
  }),
  columnHelper.accessor('content', {
    header: 'Value',
    cell(props) {
      return <Text truncate>{props.getValue()}</Text>;
    }
  }),
  columnHelper.accessor('ttl', {
    header: 'TTL',
    cell(props) {
      const ttl = props.renderValue();
      return ttl === 1 ? 'Auto' : ttl;
    },
    size: 48,
    minSize: 48,
    maxSize: 56
  }),
  columnHelper.accessor('proxied', {
    header: 'CDN',
    cell(props) {
      const proxied = props.getValue();
      return (
        <ProxiedCell proxied={proxied} />
      );
    },
    // size: 32,
    minSize: 32,
    maxSize: 36
  }),
  columnHelper.display({
    id: 'actions',
    // size: 128,
    minSize: 128,
    maxSize: 160,
    meta: {
      isFixed: true
    },
    cell() {
      return (
        <ActionCell />
      );
    }
  })
];

export default function DNSDataTable() {
  const { cx, classes } = useStyles();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20
  });

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

  const { data } = useCloudflareListDNSRecords(pagination.pageIndex, pagination.pageSize);

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

  const table = useReactTable({
    // https://github.com/TanStack/table/discussions/4179#discussioncomment-3631326
    defaultColumn: {
      minSize: 0,
      size: 0
    },
    data: data?.result || EMPTY_ARRAY,
    pageCount: data?.result_info?.total_pages ?? -1,
    state: { pagination },
    manualPagination: true,
    onPaginationChange: setPagination,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  // const handlePageIndexChange = useCallback((pageIndex: number) => {
  //   table.setPageIndex(pageIndex);
  // }, [table]);

  return (
    <Card withBorder shadow="lg" p={0}>
      <ScrollArea
        sx={{
          maxWidth: '100%',
          overflowX: 'scroll',
          overflowY: 'hidden'
        }}
        styles={{
          scrollbar: {
            zIndex: 300
          }
        }}
        ref={containerElementRef}
        viewportRef={containerViewportRef}
        onScrollPositionChange={handleScrollAreaPositionChange}
      // offsetScrollbars
      // type="always"
      >
        <Table
          // withBorder
          w="100%"
          sx={{ position: 'relative' }}
          ref={tableElementRef}
        >
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className={classes.cellBg}>
                {headerGroup.headers.map(header => {
                  const headerWidth = header.getSize();
                  return (
                    <th
                      key={header.id}
                      style={{ width: headerWidth !== 0 ? headerWidth : undefined, userSelect: 'none' }}
                      colSpan={header.colSpan}
                      className={cx(
                        classes.cellBg,
                        header.column.columnDef.meta?.isFixed && classes.fixedRightColumn,
                        isRightColumnFixed && header.column.columnDef.meta?.isFixed && !isReachRightEndOfScrollArea && classes.fixedRightColumnActive
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <Box sx={{ whiteSpace: 'nowrap' }}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </Box>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    const cellWidth = cell.column.getSize();

                    return (
                      <td
                        key={cell.id}
                        style={{ width: cellWidth !== 0 ? cellWidth : undefined }}
                        className={cx(
                          classes.cellBg,
                          cell.column.columnDef.meta?.isFixed && classes.fixedRightColumn,
                          isRightColumnFixed && cell.column.columnDef.meta?.isFixed && !isReachRightEndOfScrollArea && classes.fixedRightColumnActive
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
      <Group p={16}>
        <Pagination
          total={table.getPageCount()}
          value={pagination.pageIndex}
          onChange={table.setPageIndex}
          onNextPage={table.nextPage}
          onPreviousPage={table.previousPage}
        />
        <NativeSelect
          size="sm"
          data={['React', 'Vue', 'Angular', 'Svelte']}
        />
      </Group>
    </Card>
  );
}
