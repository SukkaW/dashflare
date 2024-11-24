import { memo, useMemo } from 'react';
import { Navbar, NavLink as MantineNavLink, rem, createStyles, Text, Group, Button } from '@mantine/core';
import { Link, NavLink as ReactRouterNavLink, useLocation, useParams } from 'react-router-dom';
import type { Icon } from '@tabler/icons-react';
import { IconArrowLeft } from '@tabler/icons-react';

import { homeNavLinks, zoneNavLinks } from '@/router';

interface NavLinkProps {
  to: string,
  label: string,
  icon: Icon
}

const useStyles = createStyles({
  a: { textDecoration: 'none' }
});

const NavLink = memo(({
  to,
  label,
  icon: Icon
}: NavLinkProps) => {
  const { classes } = useStyles();

  return (
    <ReactRouterNavLink
      className={classes.a}
      to={to}
      end
    >
      {({ isActive }) => (
        <MantineNavLink
          label={<Text fw={isActive ? 600 : 400}>{label}</Text>}
          variant="filled"
          active={isActive}
          icon={
            <Icon size={rem(16)} />
          }
        />
      )}
    </ReactRouterNavLink>
  );
});

function SidebarContent() {
  // const isTokenActive = useIsCloudflareApiTokenValid();
  const { zoneId, zoneName } = useParams();
  // if (!isTokenActive || !zoneId || !zoneName) return null;
  const { pathname } = useLocation();

  return (
    <>
      {
        zoneName && (
          <Navbar.Section p="md" sx={theme => ({ borderBottom: `${rem(1)} solid ${theme.colors.gray[2]}` })}>
            <Group spacing="sm">
              <Button component={Link} to="/" variant="subtle" p={8}>
                <IconArrowLeft size={rem(24)} />
              </Button>

              <Text fw={600} size="lg">{zoneName}</Text>
            </Group>
          </Navbar.Section>
        )
      }
      <Navbar.Section p="md" grow>
        {useMemo(() => {
          if (pathname === '/' || zoneId == null) {
            return (
              <>
                {homeNavLinks.map((link) => (
                  <NavLink
                    key={link.index ? '/' : link.path!}
                    to={link.index ? '/' : link.path!}
                    label={link.label}
                    icon={link.icon}
                  />
                ))}
              </>
            );
          }

          return (
            <>
              {zoneNavLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={
                    link.path === ''
                      ? `/${zoneId}/${zoneName}`
                      : `/${zoneId}/${zoneName}/${link.path}`
                  }
                  label={link.label}
                  icon={link.icon}
                />
              ))}
            </>
          );
        }, [pathname, zoneId, zoneName])}
      </Navbar.Section>
    </>
  );
}

export default memo(SidebarContent);
