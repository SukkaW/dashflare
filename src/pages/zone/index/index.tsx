import { Card, Stack, Text, Title } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useCloudflareZoneSettings } from '@/lib/cloudflare/zone';

const ZoneSubscriptions = () => {
  const { data } = useCloudflareZoneSettings();
  return (
    <Card withBorder>
      <Stack>
        <Title order={2}>
          Subscriptions
        </Title>
        <Text>
          {JSON.stringify(data)}
        </Text>
      </Stack>
    </Card>
  );
};

export default function ZoneIndexPage() {
  const { zoneName } = useParams();
  if (!zoneName) return null;

  return (
    <Stack>
      <Title>
        Overview
      </Title>
      <ZoneSubscriptions />
    </Stack>
  );
}
