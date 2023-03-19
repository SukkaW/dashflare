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
  Center,
  Container
} from '@mantine/core';
import { IconCloudflare } from '../icons/cloudflare';
import { Link, Outlet } from 'react-router-dom';
import SidebarContent from './sidebar';
import HeaderContent from './header';
import { useIsMatch } from '@/hooks/use-is-match';

export default function Layout() {
  const theme = useMantineTheme();
  const [navbarMobileOpened, setNavbarMobileOpened] = useState(false);
  const { css } = useCss();
  const toggleNavbarMobile = useCallback(() => setNavbarMobileOpened((o) => !o), []);
  const isMatchLogin = useIsMatch('/login');

  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      navbar={
        isMatchLogin
          ? undefined
          : (
            <Navbar p={0} hiddenBreakpoint="sm" hidden={!navbarMobileOpened} width={{ sm: 300 }}>
              <SidebarContent />
            </Navbar>
          )
      }
      header={
        <Header height={{ base: 50 }} p="md" zIndex={101}>
          <Flex h="100%" align="center" justify="space-between">
            {
              !isMatchLogin && (
                <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                  <Burger
                    opened={navbarMobileOpened}
                    onClick={toggleNavbarMobile}
                    size="sm"
                    color={theme.colors.gray[6]}
                    mr="xl"
                  />
                </MediaQuery>
              )
            }

            <UnstyledButton component={Link} to="/">
              <Group spacing="xs">
                <IconCloudflare className={css({ width: 24, height: 24, color: theme.colors.orange[6] })} />
                <Text fw={600} size="xl">Dashflare</Text>
              </Group>
            </UnstyledButton>

            <HeaderContent isMatchLogin={isMatchLogin} />
          </Flex>
        </Header>
      }
    >
      <Container size="xl">
        <Suspense
          fallback={
            <Center h="100%" w="100%">
              <Loader size="xl" />
            </Center>
          }
        >
          <Outlet />
        </Suspense>
      </Container>
    </AppShell>
  );
}
