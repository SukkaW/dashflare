import { Alert, Button, Container, Stack, TextInput, Title, rem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { fetcherWithAuthorization, handleFetchError } from '@/lib/fetcher';
import { mutate } from 'swr';
import { memo, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useSetToken } from '@/context/token';
import Disclaimer from '@/components/disclaimer';
import { useNavigate } from 'react-router-dom';
import { preloadCloudflareZoneList } from '@/lib/cloudflare/zone-list';

const LoginForm = memo(() => {
  const form = useForm({
    initialValues: {
      token: ''
    },
    validate: {
      token: (value) => (typeof value === 'string' && value.trim().length > 0 ? null : 'Invalid Token')
    },
    validateInputOnBlur: true
  });

  const setToken = useSetToken();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <form
      onSubmit={form.onSubmit(async ({ token }) => {
        setIsLoading(true);
        const key = ['client/v4/user/tokens/verify', token] as [string, string];
        try {
          const r = await fetcherWithAuthorization<Cloudflare.APIResponse<Cloudflare.TokenStatus>>(key);

          mutate(key, r);
          preloadCloudflareZoneList(token);

          notifications.show({
            id: 'login-success',
            title: 'Log in successfully',
            message: 'You will be redirected to the dashboard shortly'
          });

          setToken(token);

          navigate('/', {
            // TODO: this is a hack to solve a race condition
            // see is-logged-in.tsx for more information
            state: { token }
          });
        } catch (e) {
          handleFetchError(e, 'Failed to Login');
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
        <Button loading={isLoading} type="submit">Continue With Your API Token</Button>
      </Stack>
    </form>
  );
});

export default function LoginPage() {
  return (
    <Container size="md" py={{ base: 32, md: 48, lg: 92 }}>
      <Stack spacing="lg" maw={600} mt={24}>
        <Title order={1}>
          Log in to Dashflare
        </Title>

        <LoginForm />
        <Alert icon={<IconAlertCircle size={rem(24)} />} title="Note" color="yellow">
          Your API token will only be stored in your browser locally and will only be sent to Cloudflare&apos;s API server directly.
        </Alert>
        <Disclaimer />
      </Stack>
    </Container>
  );
}
