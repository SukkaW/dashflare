import { Group, UnstyledButton, rem, Menu, Box } from '@mantine/core';
import { IconBrandGithub, IconChevronDown, IconUserCircle } from '@tabler/icons-react';
import { DarkModeSwitch } from '../darkmode-switch-menu';
import { useDisclosure } from '@mantine/hooks';
import TokenViewer from '../token-modal';
import { useLogout } from '@/context/token';
import { memo } from 'react';

interface HeaderContentProps {
  isMatchLogin: boolean;
}

function HeaderContent({ isMatchLogin }: HeaderContentProps) {
  const [opened, { open, close }] = useDisclosure();
  const logout = useLogout();

  return (
    <>
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
            })}>
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

          {!isMatchLogin && <Menu.Label>Account</Menu.Label>}
          {!isMatchLogin && <Menu.Item onClick={open}>View Token</Menu.Item>}
          {!isMatchLogin && <Menu.Item color="red" onClick={logout}>Log Out</Menu.Item>}
        </Menu.Dropdown>
      </Menu>
      {!isMatchLogin && <TokenViewer opened={opened} onClose={close} />}
    </>
  );
}

export default memo(HeaderContent);
