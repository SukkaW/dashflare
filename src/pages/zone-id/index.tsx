import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useCloudflareZoneList } from '@/lib/cloudflare/zone-list';
import { Center, Loader } from '@mantine/core';

export default function ZoneIdPage() {
  const { data, isLoading } = useCloudflareZoneList();
  const { zoneId } = useParams();

  if (isLoading) {
    return (
      <Center h="100%" w="100%">
        <Loader size="xl" />
      </Center>
    );
  }

  if (data?.result) {
    const zone = data.result.find(i => i.id === zoneId);
    if (!zone) {
      return <Navigate to="/404" />;
    }
  }

  return (
    <Outlet />
  );
}
