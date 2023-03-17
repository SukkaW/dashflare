import { useCallback, useState } from 'react';
import {
  AppShell,
  Navbar,
  Header,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  useCss,
  Flex
} from '@mantine/core';
import { IconCloudflare } from '../icons/cloudflare';
import { Outlet } from 'react-router-dom';
import SidebarContent from './sidebar';
import { TokenProvider } from '../../provider/token';
import HeaderContent from './header';

export default function Layout() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const { css } = useCss();

  return (
    <TokenProvider>
      <AppShell
        navbarOffsetBreakpoint="sm"
        navbar={
          <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 300 }}>
            <SidebarContent />
          </Navbar>
        }
        header={
          <Header height={{ base: 50 }} p="md" zIndex={101}>
            <Flex h="100%" align="center">
              <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                <Burger
                  opened={opened}
                  onClick={useCallback(() => setOpened((o) => !o), [])}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>

              <IconCloudflare className={css({ width: 24, height: 24, color: theme.colors.orange[6] })} />

              <Text ml={8} fw={600} size="xl">Dashflare</Text>

              <HeaderContent ml="md" />
            </Flex>
          </Header>
        }
      >
        <Outlet />
      </AppShell>
    </TokenProvider>
  );
}
