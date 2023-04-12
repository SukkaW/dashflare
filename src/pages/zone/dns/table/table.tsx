import { Box, Button, Group, Table, Text } from '@mantine/core';
import { IconCloudflare } from '@/components/icons/cloudflare';
import type { PaginationState } from '@tanstack/react-table';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { forwardRef, memo } from 'react';
import { useStyles } from './table.styles';

const columnHelper = createColumnHelper<Cloudflare.DNSRecord>();
const EMPTY_ARRAY: Cloudflare.DNSRecord[] = [];

const ProxiedCell = memo(({ proxied }: Pick<Cloudflare.DNSRecord, 'proxied'>) => {
  const { cx, classes } = useStyles();
  return (
    <Group noWrap align="center" spacing="xs" sx={{ userSelect: 'none' }}>
      <IconCloudflare
        width={20}
        height={20}
        className={cx(classes.proxiedIcon, proxied ? classes.proxiedIconActive : classes.proxiedIconInactive)}
      />
      <Text sx={{ whiteSpace: 'nowrap' }}>
        {proxied ? 'Proxied' : 'DNS Only'}
      </Text>
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
    size: 48,
    minSize: 48,
    maxSize: 64
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

interface DNSDataTableProps {
  data: Cloudflare.DNSRecord[] | undefined
  pageCount: number,
  pagination: PaginationState,
  isRightColumnFixed: boolean,
  isReachRightEndOfScrollArea: boolean
}

const DNSDataTable = forwardRef<HTMLTableElement, DNSDataTableProps>(({
  data,
  pageCount,
  pagination,
  isRightColumnFixed,
  isReachRightEndOfScrollArea
}, ref) => {
  const { cx, classes } = useStyles();

  const table = useReactTable({
    // https://github.com/TanStack/table/discussions/4179#discussioncomment-3631326
    defaultColumn: {
      minSize: 0,
      size: 0
    },
    data: data || EMPTY_ARRAY,
    pageCount,
    state: { pagination },
    manualPagination: true,
    // onPaginationChange: setPagination,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <Table
      // withBorder
      w="100%"
      ref={ref}
      className={classes.table}
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
  );
});

export default DNSDataTable;
