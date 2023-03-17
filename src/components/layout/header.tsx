import type { BoxProps } from '@mantine/core';
import { Box, Select } from '@mantine/core';
import { useCloudflareZoneList } from '@/lib/cloudflare/zone-list';
import { useAtom } from 'jotai';
import { currentZoneIdAtom } from '@/state';

const ZoneMenu = () => {
  const { data, isLoading, error } = useCloudflareZoneList();
  const [currentZoneId, setCurrentZoneId] = useAtom(currentZoneIdAtom);

  return (
    <Select
      disabled={isLoading || error || !data || !data.result}
      // eslint-disable-next-line no-nested-ternary -- It's fine
      placeholder={isLoading ? 'Loading...' : error ? 'Failed to load' : 'Select a zone'}
      onChange={setCurrentZoneId}
      value={currentZoneId}
      data={
        data?.result?.map(i => ({
          value: i.id,
          label: i.name
        }))
        || []
      }
    />
  );
};

export default function HeaderContent(props: BoxProps) {
  return (
    <Box {...props}>
      <ZoneMenu />
    </Box>
  );
}
