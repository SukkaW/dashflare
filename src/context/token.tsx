import { createContext, useCallback, useContext, useState } from 'react';
import { useRetimer } from 'foxact/use-retimer';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { requestIdleCallback } from 'foxact/request-idle-callback';

const TokenContext = createContext<string | null>(null);
export const useToken = () => {
  const token = useContext(TokenContext);

  return token!;
};

const SetTokenContext = createContext<((input: string | null) => void) | null>(null);
export const useSetToken = () => {
  const setToken = useContext(SetTokenContext);

  if (!setToken) {
    throw new Error('You must wrap your app with <TokenProvider />');
  }

  return setToken;
};

const TOKEN_NAME = 'cloudflare-api-token';

export const useLogout = () => {
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
};

export const TokenProvider = ({ children }: React.PropsWithChildren) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_NAME) || null;
    } catch {
      return null;
    }
  });

  // dedupe requestIdleCallback calls
  const retimer = useRetimer();
  const $setToken = useCallback((input: string | null) => {
    setToken(input);
    const timerId = requestIdleCallback(() => {
      if (input) {
        localStorage.setItem(TOKEN_NAME, input);
      } else {
        localStorage.removeItem(TOKEN_NAME);
      }
    });
    retimer(timerId);
  }, [retimer]);

  return (
    <SetTokenContext.Provider value={$setToken}>
      <TokenContext.Provider value={token}>
        {children}
      </TokenContext.Provider>
    </SetTokenContext.Provider>
  );
};
