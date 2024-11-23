import { Stack, Title, Text, Skeleton, Button, Alert, Pagination, TextInput, Loader, Group, rem, Anchor, Table, Select } from '@mantine/core';
import Disclaimer from '@/components/disclaimer';
import { memo } from 'react';
import { useCloudflareZoneList } from '@/lib/cloudflare/zone-list';
import { IconAlertCircle, IconSearch } from '@tabler/icons-react';
import { useUncontrolled } from 'foxact/use-uncontrolled';
import { Link } from 'react-router-dom';

import title from 'title';
import { generateAbsoluteURL } from '@/lib/url';
import { usePagination } from '@/hooks/use-pagination';
import { PAGE_SIZE_ARRAY } from '@/lib/constants';

const ZoneListLoading = memo(() => (
  <>
    <Skeleton h={18} my={4} width={160} />
    <Skeleton h={36} width={240} />
    <Skeleton h={240} />
  </>
));

function ZoneList() {
  const { pagination, handlePageIndexChange, handlePageSizeChange } = usePagination({
    pageIndex: 1,
    pageSize: 20
  });

  const [searchQuery, handleCommitSearchQuery, searchInputRef] = useUncontrolled('');
  const { data, error, isLoading } = useCloudflareZoneList(pagination.pageIndex, pagination.pageSize, searchQuery);

  if (isLoading && !data) return <ZoneListLoading />;
  if (error) {
    return (
      <Text>Failed to load avaliable zones!</Text>
    );
  }

  const totalPage = data?.result_info?.total_pages;

  return (
    <>
      <Text fw={600}>Select a zone to start:</Text>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleCommitSearchQuery();
      }}
      >
        <Group>
          <TextInput
            ref={searchInputRef}
            placeholder="Search zones..."
            icon={
              isLoading && searchQuery
                ? <Loader size="xs" />
                : <IconSearch size={rem(16)} />
            }
          />
          <Button type="submit">Search</Button>
        </Group>
      </form>

      <Table verticalSpacing={8}>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Status</th>
            <th>Provider</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data?.result.map((zone) => (
            <tr key={zone.id}>
              <td>{zone.name}</td>
              <td>{title(zone.status)}</td>
              <td>
                <Text truncate maw={256} title={zone.host?.name || 'Cloudflare'}>
                  {
                    zone.host?.website
                      ? <Anchor target="_blank" href={generateAbsoluteURL(zone.host.website)}>{zone.host.name}</Anchor>
                      : (zone.host?.name || 'Cloudflare')
                  }
                </Text>
              </td>
              <td>
                <Button compact variant="default" component={Link} to={`/${zone.id}/${zone.name}`}>Enter</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPage != null && totalPage > 1 && (
        <>
          <Pagination
            total={totalPage}
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
        </>
      )}

      <Alert icon={<IconAlertCircle size="1rem" />} title="Don't see your zone here?" color="yellow">
        Dashflare can only access zones you have selected when you created your API token.
      </Alert>
    </>
  );
}

export default function Homepage() {
  return (
    <Stack>
      <Title>Welcome to Dashflare!</Title>
      <Disclaimer />
      <ZoneList />
    </Stack>
  );
}
