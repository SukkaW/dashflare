import { createContext, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { createLocalStorageState } from 'foxact/create-local-storage-state';

const TOKEN_NAME = 'cloudflare-api-token';

const [_useTokenState, useToken, useSetRawToken] = createLocalStorageState<string | null>(TOKEN_NAME, null, { raw: true });

export { useToken };
export const useSetToken = useSetRawToken;
export function useLogout() {
  const setToken = useSetToken();
  const navigate = useNavigate();

  return useCallback(() => {
    setToken(null);
    notifications.show({
      id: 'logged-out', // dedupe notifications
      title: 'You have successfully logged out',
      message: 'You will be redirected to the login page shortly'
    });
    navigate('/login', {
      // FIXME: this is a hack to solve a race condition
      // see the source code of login page for more information
      state: { logout: true }
    });
  }, [navigate, setToken]);
}
