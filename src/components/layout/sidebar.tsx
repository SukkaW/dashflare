import { memo, useMemo } from 'react';
import { useCloudflareApiTokenStatus } from '@/lib/cloudflare/token-status';
import { useToken } from '@/provider/token';
import { Navbar, NavLink as MantineNavLink, rem, createStyles, Text, Group, Divider, Button } from '@mantine/core';
import { Link, NavLink as ReactRouterNavLink, useParams } from 'react-router-dom';
import type { Icon} from '@tabler/icons-react';
import { IconArrowLeft, IconLock } from '@tabler/icons-react';

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

  const { zoneId, zoneName } = useParams();
  if (!isTokenActive || !zoneId || !zoneName) return null;

  return (
    <>
      <Navbar.Section p="md">
        <Group spacing="sm">
          <Button component={Link} to="/" variant="subtle" p={8}>
            <IconArrowLeft size={rem(24)} />
          </Button>

          <Text fw={600} size="lg">{zoneName}</Text>
        </Group>
      </Navbar.Section>
      <Divider />
      <Navbar.Section p="md" grow>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            label={link.label}
            icon={link.icon}
          />
        ))}
      </Navbar.Section>
    </>
  );
}

export default memo(SidebarContent);
