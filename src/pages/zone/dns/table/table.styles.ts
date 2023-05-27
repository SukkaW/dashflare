import { createStyles, rem } from '@mantine/core';

export const useStyles = createStyles(theme => ({
  table: {
    borderBottomWidth: rem(1),
    borderBottomStyle: 'solid',
    borderBottomColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
    borderTopWidth: rem(1),
    borderTopStyle: 'solid',
    borderTopColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
    position: 'relative'
  },
  noWrap: {
    whiteSpace: 'nowrap'
  },
  valueCell: {
    maxWidth: rem(128),
    '@media screen and (min-width: 640px)': {
      maxWidth: rem(256)
    },
    '@media screen and (min-width: 960px)': {
      maxWidth: rem(384)
    },
    '@media screen and (min-width: 1440px)': {
      maxWidth: rem(512)
    }
  },
  proxiedIcon: {
    width: 20,
    height: 20
  },
  proxiedIconActive: {
    color: theme.colors.orange[6]
  },
  proxiedIconInactive: {
    color: theme.colors.gray[6]
  },
  proxiedIconWhite: {
    color: theme.white
  },
  cellBg: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white
  },
  fixedRightColumn: {
    right: 0,
    // marginLeft: 2,
    position: 'sticky',
    zIndex: 50,
    '::before': {
      content: '""',
      overflow: 'hidden',
      pointerEvents: 'none',
      touchAction: 'none',
      userSelect: 'none',
      position: 'absolute',
      width: 10,
      left: -10,
      top: 0,
      height: '100%'
    }
  },
  fixedRightColumnActive: {
    borderLeftWidth: rem(1),
    borderLeftStyle: 'solid',
    borderLeftColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : 'transparent',
    '::before': {
      boxShadow: 'inset -10px 0 12px -10px rgba(0, 0, 0, .15)'
    }
  }
}));
