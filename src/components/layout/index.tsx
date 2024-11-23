import { Suspense, useCallback, useState, lazy } from 'react';
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
  Container,
  Skeleton
} from '@mantine/core';
import { IconCloudflare } from '../icons/cloudflare';
import { Link, Outlet } from 'react-router-dom';
import { ModalsProvider } from '@mantine/modals';
import { useReactRouterIsMatch } from 'foxact/use-react-router-is-match';
import { useReactRouterEnableConcurrentNavigation } from 'foxact/use-react-router-enable-concurrent-navigation';

const HeaderContent = lazy(() => import('./header'));
const SidebarContent = lazy(() => import('./sidebar'));

export default function Layout() {
  const theme = useMantineTheme();
  const [navbarMobileOpened, setNavbarMobileOpened] = useState(false);
  const { css } = useCss();
  const toggleNavbarMobile = useCallback(() => setNavbarMobileOpened((o) => !o), []);
  const isMatchLogin = useReactRouterIsMatch('/login');

  useReactRouterEnableConcurrentNavigation();

  return (
    <ModalsProvider>
      <AppShell
        navbarOffsetBreakpoint="sm"
        navbar={
          isMatchLogin
            ? undefined
            : (
              <Navbar p={0} hiddenBreakpoint="sm" hidden={!navbarMobileOpened} width={{ sm: 300 }}>
                <Suspense fallback={null}>
                  <SidebarContent />
                </Suspense>
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

              <Suspense fallback={
                <Center w={66} px="sm">
                  <Skeleton radius="md" height={18} width={66} />
                </Center>
              }
              >
                <HeaderContent isMatchLogin={isMatchLogin} />
              </Suspense>
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
    </ModalsProvider>
  );
}
