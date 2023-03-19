import { createContext, useCallback, useContext, useState } from 'react';
import { useRetimer } from '../hooks/use-retimer';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

const TokenContext = createContext<string | null>(null);
export const useToken = () => useContext(TokenContext);

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
    navigate('/login');
  }, [navigate, setToken]);
};

export const TokenProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [token, _setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_NAME) || null;
    } catch {
      return null;
    }
  });

  // dedupe requestIdleCallback calls
  const retimer = useRetimer();
  const setToken = useCallback((input: string | null) => {
    _setToken(input);

    retimer(requestIdleCallback(() => {
      if (!input) {
        localStorage.removeItem(TOKEN_NAME);
      } else {
        localStorage.setItem(TOKEN_NAME, input);
      }
    }));
  }, [retimer]);

  return (
    <SetTokenContext.Provider value={setToken}>
      <TokenContext.Provider value={token}>
        {children}
      </TokenContext.Provider>
    </SetTokenContext.Provider>
  );
};
