import { Group, rem, useMantineColorScheme, Select, Text } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { forwardRef, useCallback } from 'react';

interface DarkModeSwitchItemProps {
  icon: Icon,
  label: string
}

const DarkModeSwitchItem = forwardRef<HTMLDivElement, DarkModeSwitchItemProps>(({ icon: Icon, label, ...rest }, ref) => (
  <Group noWrap ref={ref} {...rest}>
    <Icon size={rem(16)} />
    <Text size="sm">{label}</Text>
  </Group>
));

export function DarkModeSwitch() {
  // eslint-disable-next-line @typescript-eslint/unbound-method -- stupid ts
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Select
      size="xs"
      value={colorScheme}
      onChange={useCallback((value: string | null) => {
        if (value === 'light' || value === 'dark') {
          toggleColorScheme(value);
        }
      }, [toggleColorScheme])}
      itemComponent={DarkModeSwitchItem}
      data={[
        { value: 'light', label: 'Light', icon: IconSun },
        { value: 'dark', label: 'Dark', icon: IconMoon }
      ]}
    />
  );
}
