import type { SelectItem } from '@mantine/core';
import { Card, Center, Grid, Switch, Title, createStyles, rem, Text, LoadingOverlay, TextInput, NativeSelect, Loader, Group, Button } from '@mantine/core';
import { memo, useCallback, useMemo, useRef } from 'react';
import { useCloudflareZoneSetting, useUpdateCloudflareZoneSetting } from '@/lib/cloudflare/settings';

const useStyles = createStyles((theme) => ({
  cardActionCol: {
    border: '0',
    alignSelf: 'stretch',
    height: 'auto',
    position: 'relative',
    borderTopWidth: rem(1),
    borderTopColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
    borderTopStyle: 'solid',
    borderLeftWidth: 0,
    borderLeftStyle: 'solid',

    [theme.fn.largerThan('md')]: {
      borderTopWidth: 0,
      borderTopColor: 'transparent',
      borderLeftWidth: rem(1),
      borderLeftColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }
  }
}));

interface CloudflareSettingCardProps<T extends keyof Cloudflare.ZoneSettingsValue> {
  title: string;
  description: string | React.ReactNode;
  type: Cloudflare.ZoneSettingsValue[T] extends Cloudflare.ZoneSettingBooleanType
    ? 'switch'
    : 'select' | 'input' | 'readonly_json';
  settingKey: T;
  selections?: { label: string, value: Cloudflare.ZoneSettingsValue[T] }[]
}

function CloudflareSettingCard<T extends keyof Cloudflare.ZoneSettingsValue>({
  title,
  description,
  type,
  settingKey,
  selections
}: CloudflareSettingCardProps<T>) {
  const { classes } = useStyles();
  const { data, isLoading } = useCloudflareZoneSetting(settingKey);
  const { trigger, isMutating } = useUpdateCloudflareZoneSetting(settingKey, title);

  const textInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if ('checked' in evt.currentTarget) {
      if (type === 'switch') {
        const value = evt.currentTarget.checked ? 'on' : 'off';
        trigger(value as Cloudflare.ZoneSettingsValue[T]);
      }
    } else if (type === 'select') {
      trigger(evt.currentTarget.value as Cloudflare.ZoneSettingsValue[T]);
    }
  }, [trigger, type]);

  const handleTextInputFormSubmit = useCallback((evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (type === 'input') {
      const value = textInputRef.current?.value;
      if (value) {
        trigger(value as Cloudflare.ZoneSettingsValue[T]);
      }
    }
  }, [trigger, type]);

  return (
    <Card withBorder>
      <Grid gutter={0}>
        {useMemo(() => (
          <Grid.Col xs={12} md={9} lg={9} px={16}>
            <Title order={4}>{title}</Title>
            <Text color="gray">{description}</Text>
            {(data?.result.editable === false) && (
              <Text color="red" size="xs">
                This Setting can not be modified. It is most likely that your plan doesn&apos;t allow you to do so.
              </Text>
            )}
          </Grid.Col>
        ), [data?.result.editable, description, title])}
        <Grid.Col xs={12} md={3} lg={3} className={classes.cardActionCol}>
          {useMemo(() => (
            <Center h="100%" pl={16} w="100%">
              {type !== 'switch' && <LoadingOverlay loaderProps={{ size: 'sm' }} visible={isLoading || isMutating} overlayBlur={2} />}
              {type === 'switch' && (
                <Switch
                  checked={data?.result.value === 'on'}
                  onChange={handleInputChange}
                  disabled={!data?.result.editable}
                  thumbIcon={
                    (isLoading || isMutating)
                      ? <Loader size={8} />
                      : undefined
                  }
                />
              )}
              {type === 'readonly_json' && (
                <TextInput
                  disabled
                  value={data?.result.value ? JSON.stringify(data?.result.value) : ''}
                />
              )}
              {type === 'input' && (
                <form onSubmit={handleTextInputFormSubmit}>
                  <Group noWrap>
                    <TextInput
                      ref={textInputRef}
                      size="sm"
                      disabled={!data?.result.editable}
                      defaultValue={data?.result.value as string}
                      icon={
                        (isLoading || isMutating)
                          ? <Loader size="xs" />
                          : null
                      }
                    />
                    <Button size="sm" type="submit">Submit</Button>
                  </Group>
                </form>
              )}
              {type === 'select' && !!selections && (
                <NativeSelect
                  disabled={!data?.result.editable}
                  value={data?.result.value as string}
                  data={selections as SelectItem[]}
                  onChange={handleInputChange}
                />
              )}
            </Center>
          ), [data, handleInputChange, handleTextInputFormSubmit, isLoading, isMutating, selections, type])}
        </Grid.Col>
      </Grid>

    </Card>
  );
}

export default memo(CloudflareSettingCard) as typeof CloudflareSettingCard;
