import { useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { createLocalStorageState } from 'foxact/create-local-storage-state';

const TOKEN_NAME = 'cloudflare-api-token';

export const [_, useToken, useSetToken] = createLocalStorageState(TOKEN_NAME, undefined, { raw: true });

export function useLogout() {
  const setToken = useSetToken();

  return useCallback((showMessage = true) => {
    setToken(null);
    if (showMessage) {
      notifications.show({
        id: 'logged-out', // dedupe notifications
        title: 'You have successfully logged out',
        message: 'You will be redirected to the login page shortly'
      });
    }
  }, [setToken]);
}
