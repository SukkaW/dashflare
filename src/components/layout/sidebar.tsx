import { memo, useMemo } from 'react';
import { useCloudflareApiTokenStatus } from '@/lib/cloudflare/token-status';
import { useToken } from '@/provider/token';
import { Navbar, NavLink as MantineNavLink, rem, createStyles, Text } from '@mantine/core';
import { NavLink as ReactRouterNavLink, useParams } from 'react-router-dom';
import type { Icon } from '@tabler/icons-react';
import { IconLock } from '@tabler/icons-react';

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
  const { zoneId } = useParams();

  if (!zoneId) return null;

  return (
    <ReactRouterNavLink className={classes.a} to={`/${zoneId}/${to}`}>
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

const navLinks = [
  {
    label: 'SSL Certificates',
    icon: IconLock,
    to: 'ssl'
  }
];

function SidebarContent() {
  const token = useToken();
  const { isLoading, data } = useCloudflareApiTokenStatus(token);
  const isTokenActive = useMemo(() => {
    if (isLoading) return false;
    if (!data) return false;
    return data.success && data.result.status === 'active';
  }, [data, isLoading]);

  const { zoneId } = useParams();
  if (!isTokenActive || !zoneId) return null;

  return (
    <Navbar.Section grow mt="md">
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          label={link.label}
          icon={link.icon}
        />
      ))}
    </Navbar.Section>
  );
}

export default memo(SidebarContent);
