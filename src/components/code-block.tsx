import type { BoxProps } from '@mantine/core';
import { Code, CopyButton, ActionIcon, Box, createStyles, rem } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

interface CodeBlockProps extends BoxProps {
  children: string
}

const useStyles = createStyles(
  (theme) => ({
    scrollArea: {},

    root: {
      position: 'relative'
    },

    code: {
      boxSizing: 'border-box',
      position: 'relative',
      fontFamily: theme.fontFamilyMonospace,
      fontSize: rem(14),
      overflowX: 'auto',
      borderRadius: theme.fn.radius('md'),
      padding: `${theme.spacing.xs} ${theme.spacing.md}`,
      marginTop: 0,
      marginBottom: 0,
      border: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]}`
    },

    copy: {
      position: 'absolute',
      top: rem(10),
      height: rem(24),
      minHeight: rem(24),
      right: theme.dir === 'ltr' ? theme.spacing.xs : 'unset',
      left: theme.dir === 'rtl' ? theme.spacing.xs : 'unset',
      padding: rem(4),
      width: rem(24),
      minWidth: rem(24),
      zIndex: 2,
      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[3]
      }
    }
  })
);

export default function CodeBlock({
  className,
  children,
  ...others
}: CodeBlockProps) {
  const { classes, cx } = useStyles();

  return (
    <Box className={cx(classes.root, className)} {...others} translate="no">
      <CopyButton value={children} timeout={2000}>
        {({ copied, copy }) => (
          <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy} className={classes.copy} mih={16}>
            {copied ? <IconCheck size={rem(16)} /> : <IconCopy size={rem(16)} />}
          </ActionIcon>
        )}
      </CopyButton>
      <Code className={classes.code} block>{children}</Code>
    </Box>
  );
}
