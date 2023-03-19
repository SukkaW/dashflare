import { memo, useMemo } from 'react';
import { useCloudflareApiTokenStatus } from '@/lib/cloudflare/token-status';
import { useToken } from '@/provider/token';
import { Navbar, NavLink as MantineNavLink, rem, createStyles, Text, Group, Button } from '@mantine/core';
import { Link, NavLink as ReactRouterNavLink, useParams } from 'react-router-dom';
import type { Icon} from '@tabler/icons-react';
import { IconArrowLeft } from '@tabler/icons-react';

import { navLinks } from '@/router';

interface NavLinkProps {
  to: string;
  label: string;
  icon: Icon
}

const useStyles = createStyles({
  a: { textDecoration: 'none' }
});

const NavLink = ({
  to,
  label,
  icon: Icon
}: NavLinkProps) => {
  const { classes } = useStyles();
  const { zoneId, zoneName } = useParams();

  if (!zoneId || !zoneName) return null;

  return (
    <ReactRouterNavLink className={classes.a} to={`/${zoneId}/${zoneName}/${to}`}>
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
};

function SidebarContent() {
  const token = useToken();
  const { isLoading, data } = useCloudflareApiTokenStatus(token);
  const isTokenActive = useMemo(() => {
    if (isLoading) return false;
    if (!data) return false;
    return data.success && data.result.status === 'active';
  }, [data, isLoading]);

  const { zoneId, zoneName } = useParams();
  if (!isTokenActive || !zoneId || !zoneName) return null;

  return (
    <>
      <Navbar.Section p="md" sx={theme => ({ borderBottom: `${rem(1)} solid ${theme.colors.gray[2]}` })}>
        <Group spacing="sm">
          <Button component={Link} to="/" variant="subtle" p={8}>
            <IconArrowLeft size={rem(24)} />
          </Button>

          <Text fw={600} size="lg">{zoneName}</Text>
        </Group>
      </Navbar.Section>
      <Navbar.Section p="md" grow>
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            label={link.label}
            icon={link.icon}
          />
        ))}
      </Navbar.Section>
    </>
  );
}

export default memo(SidebarContent);
