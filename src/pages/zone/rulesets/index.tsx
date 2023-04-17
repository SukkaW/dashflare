import { Card, Stack, Title, Text, Group, Badge } from '@mantine/core';
import { useCloudflareListRuleset } from '@/lib/cloudflare/ruleset';
import { useMemo } from 'react';

import dayjs from 'dayjs';

const RulesetInfoCard = ({
  name,
  description,
  phase,
  last_updated
}: Cloudflare.RulesetsInfo) => {
  return (
    <Card withBorder shadow="md">
      <Group>
        <Title order={5}>{name}</Title>
        <Badge
          size="sm"
          styles={{
            root: {
              textTransform: 'none'
            }
          }}>
          {phase}
        </Badge>
        <Badge color="gray">
          {useMemo(() => {
            return dayjs(last_updated).format('YYYY/MM/DD hh:mm:ss');
          }, [last_updated])}
        </Badge>
      </Group>
      <Text size="sm" color="gray">{description}</Text>
    </Card>
  );
};

export default function RulesetsPage() {
  const { data } = useCloudflareListRuleset();

  return (
    <Stack>
      <Title>Rulesets</Title>
      <Stack>
        {(data?.result || []).map(ruleset => (
          <RulesetInfoCard {...ruleset} key={ruleset.id} />
        ))}
      </Stack>
    </Stack>
  );
}
