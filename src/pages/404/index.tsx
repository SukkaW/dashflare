import { createStyles, Title, Text, Button, Group, rem, Center } from '@mantine/core';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(80),
    paddingBottom: rem(80)
  },

  inner: {
    position: 'relative'
  },

  image: {
    ...theme.fn.cover(),
    opacity: 0.75
  },

  content: {
    paddingTop: rem(220),
    position: 'relative',
    zIndex: 1,

    [theme.fn.smallerThan('sm')]: {
      paddingTop: rem(120)
    }
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily || ''}`,
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(38),

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(32)
    }
  },

  description: {
    maxWidth: rem(540),
    margin: 'auto',
    marginTop: theme.spacing.xl,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`
  }
}));

export function NotFoundPage() {
  const { classes } = useStyles();
  const navigate = useNavigate();

  return (
    <Center className={classes.root}>
      <div className={classes.inner}>
        <svg xmlns="http://www.w3.org/2000/svg" className={classes.image} viewBox="0 0 362 145">
          <path fill="#f8f9fa" d="M62.6 142c-2.1 0-3.2-1-3.2-3.2V118h-56c-2 0-3-1-3-3V92.8c0-1.3.4-2.7 1.2-4.2L58.2 4c.8-1.3 2-2 3.8-2h28c2 0 3 1 3 3v85.4h11.2c1 0 1.7.3 2.4 1 .7.5 1 1.3 1 2.2v21.2c0 1-.3 1.7-1 2.4-.7.5-1.5.8-2.4.8H93v20.8c0 2.1-1 3.2-3.2 3.2H62.6zM33 90.4h26.4V51.2L33 90.4zm148.7 54.2a56 56 0 0 1-39.6-16.2 56 56 0 0 1-13.6-22.6 101 101 0 0 1-5-33.2 101 101 0 0 1 5-33.2 56 56 0 0 1 53.2-39 56.1 56.1 0 0 1 53.2 39 101 101 0 0 1 5 33.2 101 101 0 0 1-5 33.2 56 56 0 0 1-32 34.8c-6.7 2.7-13.8 4-21.2 4zm0-31c9 0 15.6-3.7 19.6-11.2 4.1-7.6 6.2-17.5 6.2-29.8s-2.1-22.2-6.2-29.8a20.8 20.8 0 0 0-19.6-11.4c-9 0-15.5 3.8-19.6 11.4-4 7.6-6 17.5-6 29.8s2 22.2 6 29.8a20.8 20.8 0 0 0 19.6 11.2zM316 142c-2.1 0-3.2-1-3.2-3.2V118h-56c-2 0-3-1-3-3V92.8c0-1.3.4-2.7 1.2-4.2L311.7 4c.8-1.3 2-2 3.8-2h28c2 0 3 1 3 3v85.4h11.2c1 0 1.7.3 2.4 1 .7.5 1 1.3 1 2.2v21.2c0 1-.3 1.7-1 2.4-.7.5-1.5.8-2.4.8h-11.2v20.8c0 2.1-1 3.2-3.2 3.2h-27.2zm-29.6-51.6H313V51.2l-26.4 39.2z" />
        </svg>
        <div className={classes.content}>
          <Title className={classes.title}>Nothing to see here</Title>
          <Text color="dimmed" size="lg" align="center" className={classes.description}>
            Page you are trying to open does not exist. You may have mistyped the address, or the
            page has been moved to another URL. If you think this is an error contact support.
          </Text>
          <Group position="center">
            <Button
              size="md"
              onClick={useCallback(() => {
                navigate('/');
              }, [navigate])}
            >
              Take me back to home page
            </Button>
          </Group>
        </div>
      </div>
    </Center>
  );
}
