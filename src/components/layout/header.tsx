import type { BoxProps } from '@mantine/core';
import { Box, Select } from '@mantine/core';
import { useCloudflareZoneList } from '@/lib/cloudflare/zone-list';
import { useNavigate, useParams } from 'react-router-dom';
import { useCallback } from 'react';

const ZoneMenu = () => {
  const { data, isLoading, error } = useCloudflareZoneList();
  const { zoneId } = useParams();
  const navigate = useNavigate();

  const handleChange = useCallback((value: string | null) => {
    if (!value) {
      return navigate('/');
    }
    return navigate(`/${value}`);
  }, [navigate]);

  return (
    <Select
      disabled={isLoading || error || !data || !data.result}
      // eslint-disable-next-line no-nested-ternary -- It's fine
      placeholder={isLoading ? 'Loading...' : error ? 'Failed to load' : 'Select a zone'}
      onChange={handleChange}
      value={zoneId}
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
