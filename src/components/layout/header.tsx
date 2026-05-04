import { UnstyledButton, rem, Menu, Box, Group } from '@mantine/core';
import { IconBrandGithub, IconChevronDown, IconUserCircle } from '@tabler/icons-react';
import { DarkModeSwitch } from '../darkmode-switch-menu';
import { memo } from 'react';
import { MenuContentPortalTarget } from '@/context/menu-content-portal';

function HeaderContent() {
  return (
    <Menu withinPortal>
      <Menu.Target>
        <UnstyledButton
          py="xs"
          px="sm"
          fw={500}
          fz="sm"
          lh={1}
          sx={theme => ({
            display: 'block',
            borderRadius: theme.radius.sm,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],

            '&:hover': {
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
            }
          })}
        >
          <Group spacing="xs">
            <IconUserCircle size={rem(18)} />
            <IconChevronDown size={rem(14)} />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>About</Menu.Label>
        <Menu.Item
          component="a"
          href="https://github.com/sukkaw/dashflare"
          target="_blank"
          icon={<IconBrandGithub size={rem(18)} />}
        >
          Source Code
        </Menu.Item>

        <Menu.Label>Appearance</Menu.Label>
        <Box px="xs" mb="xs">
          <DarkModeSwitch />
        </Box>

        <MenuContentPortalTarget />
      </Menu.Dropdown>
    </Menu>
  );
}

export default memo(HeaderContent);
