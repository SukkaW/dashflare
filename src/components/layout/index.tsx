import { Suspense, useCallback, useState } from 'react';
import {
  AppShell,
  Navbar,
  Header,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  useCss,
  Flex,
  UnstyledButton,
  Group,
  Loader,
  Center
} from '@mantine/core';
import { IconCloudflare } from '../icons/cloudflare';
import { Link, Outlet } from 'react-router-dom';
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

              <UnstyledButton component={Link} to="/">
                <Group spacing="xs">
                  <IconCloudflare className={css({ width: 24, height: 24, color: theme.colors.orange[6] })} />
                  <Text fw={600} size="xl">Dashflare</Text>
                </Group>
              </UnstyledButton>

              <HeaderContent ml="md" />
            </Flex>
          </Header>
        }
      >
        <Suspense
          fallback={
            <Center h="100%" w="100%">
              <Loader size="xl" />
            </Center>
          }
        >
          <Outlet />
        </Suspense>
      </AppShell>
    </TokenProvider>
  );
}
