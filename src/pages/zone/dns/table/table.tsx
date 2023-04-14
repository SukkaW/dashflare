import { Box, Button, Group, Loader, Center, Table, Text, Tooltip } from '@mantine/core';
import { IconCloudflare } from '@/components/icons/cloudflare';
import type { PaginationState } from '@tanstack/react-table';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { forwardRef, memo, useCallback } from 'react';
import { useStyles } from './table.styles';
import { openDNSRecordModal } from './modal';

const columnHelper = createColumnHelper<Cloudflare.DNSRecord>();
const EMPTY_ARRAY: Cloudflare.DNSRecord[] = [];

const ValueCell = memo(({ value }: { value: string }) => {
  const { classes } = useStyles();

  return (
    <Tooltip label={value} position="bottom-start">
      <Text className={classes.valueCell} truncate title={value}>{value}</Text>
    </Tooltip>
  );
});

const ProxiedCell = memo(({ proxied, proxiable }: Pick<Cloudflare.DNSRecord, 'proxied' | 'proxiable'>) => {
  const { cx, classes } = useStyles();

  if (!proxiable) {
    return (
      <Text className={classes.noWrap}>
        Not Proxiable
      </Text>
    );
  }

  return (
    <Group noWrap align="center" spacing="xs" sx={{ userSelect: 'none' }}>
      <IconCloudflare
        width={20}
        height={20}
        className={cx(classes.proxiedIcon, proxied ? classes.proxiedIconActive : classes.proxiedIconInactive)}
      />
      <Text className={classes.noWrap}>
        {proxied ? 'Proxied' : 'DNS Only'}
      </Text>
    </Group>
  );
});

interface ActionCellProps {
  record: Cloudflare.DNSRecord
}

const ActionCell = memo(({ record }: ActionCellProps) => {
  return (
    <Group align="center" spacing={0} noWrap>
      <Button
        compact
        variant="subtle"
        onClick={useCallback(() => openDNSRecordModal(record), [record])}>
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
      return <ValueCell value={props.getValue()} />;
    },
    size: 128,
    minSize: 128,
    maxSize: 256
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
      return <ValueCell value={props.getValue()} />;
    }
  }),
  columnHelper.accessor('ttl', {
    header: 'TTL',
    cell(props) {
      const ttl = props.renderValue();
      return ttl === 1 ? 'Auto' : ttl;
    },
    size: 64,
    minSize: 64,
    maxSize: 72
  }),
  columnHelper.accessor('proxied', {
    header: 'CDN',
    cell(props) {
      const proxied = props.getValue();
      const proxiable = props.row.original.proxiable;
      return (
        <ProxiedCell proxied={proxied} proxiable={proxiable} />
      );
    },
    size: 144,
    minSize: 144,
    maxSize: 168
  }),
  columnHelper.display({
    id: 'actions',
    // size: 128,
    minSize: 128,
    maxSize: 160,
    meta: {
      isFixed: true
    },
    cell(props) {
      return (
        <ActionCell record={props.row.original} />
      );
    }
  })
];

interface DNSDataTableProps {
  data: Cloudflare.DNSRecord[] | undefined,
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

  if (!data) {
    return (
      <Center h={288}>
        <Loader />
      </Center>
    );
  }

  if (data.length === 0) {
    return (
      <Center h={288}>
        <Text>There is no DNS records</Text>
      </Center>
    );
  }

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
