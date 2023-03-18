import { SimpleGrid, Stack, Title, Text, Skeleton, Button, Alert, Pagination, TextInput, Loader, Group, rem } from '@mantine/core';
import Disclaimer from '@/components/disclaimer';
import { memo, useState } from 'react';
import { useCloudflareZoneList } from '@/lib/cloudflare/zone-list';
import { IconAlertCircle, IconSearch } from '@tabler/icons-react';
import { createArray } from '@/lib/create-array';
import { useUncontrolled } from '@/hooks/use-uncontrolled';

const ZoneListLoading = memo(() => (
  <>
    <Skeleton h={18} my={4} width={160} />
    <SimpleGrid cols={2}>
      {createArray(4).map(i => (
        <Skeleton h={40} key={i} />
      ))}
    </SimpleGrid>
  </>
));

const ZoneList = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [searchQuery, handleCommitSearchQuery, searchInputRef] = useUncontrolled('');
  const { data, error, isLoading } = useCloudflareZoneList(pageIndex, searchQuery);

  console.log(data);

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
      }}>
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

      <SimpleGrid cols={2}>
        {data?.result?.map((zone) => (
          <Button size="md" key={zone.id} variant="default">
            <Stack>
              <Text size="sm">
                {zone.name}
              </Text>
            </Stack>
          </Button>
        ))}
      </SimpleGrid>
      {totalPage && <Pagination value={pageIndex} onChange={setPageIndex} total={totalPage} />}
      <Alert icon={<IconAlertCircle size="1rem" />} title="Don't see your zone here?" color="yellow">
        Dashflare can only access zones you have selected when you created your API token.
      </Alert>
    </>
  );
};

export default function Homepage() {
  return (
    <Stack>
      <Title>Welcome to Dashflare!</Title>
      <Disclaimer />
      <ZoneList />
    </Stack>
  );
}
