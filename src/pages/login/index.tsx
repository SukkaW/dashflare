import { Alert, Anchor, Box, Button, Container, Stack, Text, TextInput, Title, rem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { HTTPError, fetcherWithAuthorization } from '@/lib/fetcher';
import { mutate } from 'swr';
import { useState } from 'react';
import { isCloudflareAPIResponse } from '@/lib/cloudflare/types';
import { notifications } from '@mantine/notifications';
import { useSetToken } from '@/provider/token';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const form = useForm({
    initialValues: {
      token: ''
    },
    validate: {
      token: (value) => (typeof value === 'string' && value.trim().length > 0 ? null : 'Invalid Token')
    },
    validateInputOnBlur: true
  });

  const navigate = useNavigate();
  const setToken = useSetToken();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <form
      onSubmit={form.onSubmit(async ({ token }) => {
        setIsLoading(true);
        try {
          const r = await fetcherWithAuthorization<Cloudflare.APIResponse<Cloudflare.TokenStatus>>(['client/v4/user/tokens/verify', token]);
          mutate(
            ['client/v4/user/tokens/verify', token],
            r.result
          );
          setToken(token);
          notifications.show({
            id: 'login-success',
            title: 'Log in successfully',
            message: 'You will be redirected to the dashboard shortly'
          });
          navigate('/');
        } catch (e) {
          if (e instanceof HTTPError && isCloudflareAPIResponse(e.data)) {
            e.data.errors.forEach((error) => {
              notifications.show({
                color: 'red',
                id: `${error.code}-${error.message}`,
                title: 'Failed to Login',
                message: error.message
              });
            });
          }
        } finally {
          setIsLoading(false);
        }
      })}
    >
      <Stack spacing="lg">
        <TextInput
          withAsterisk
          label="API Token"
          {...form.getInputProps('token')}
        />
        <Button loading={isLoading} type="submit">Log in</Button>
      </Stack>
    </form>
  );
};

export default function LoginPage() {
  return (
    <Container size="lg" py={{ base: 32, md: 48, lg: 92 }}>
      <Title order={1}>
        Log in to Dashflare
      </Title>

      <Box maw={600} mt={24}>
        <Stack spacing="lg">
          <LoginForm />
          <Alert icon={<IconAlertCircle size={rem(24)} />} title="Note" color="yellow">
            Your API token will only be stored in your browser locally.
          </Alert>
          <Alert icon={<IconAlertCircle size={rem(24)} />} title="Note" color="gray">
            <p>
              This website is an <Text component="span" fw={700}>Unofficial</Text> control panel for Cloudflare&trade; and is not associated Cloudflare, Inc. in anyway. The source code of the website can be found on the <Anchor href="https://github.com/sukkaw/dashflare" target="_blank">GitHub</Anchor>.
            </p>
            <p>
              Cloudflare and the Cloudflare logo are trademarks and/or registered trademarks of Cloudflare, Inc. in the United States and other jurisdictions.
            </p>
          </Alert>
        </Stack>
      </Box>
    </Container>
  );
}
