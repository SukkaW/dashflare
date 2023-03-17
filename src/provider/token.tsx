import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRetimer } from '../hooks/use-retimer';
import { useMatch, useNavigate } from 'react-router-dom';
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

export const TokenProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [token, _setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_NAME) || null;
    } catch {
      return null;
    }
  });

  const isMatchLogin = useMatch('/login');
  const navigate = useNavigate();

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

  // redirect to login if there is no token
  useEffect(() => {
    if (token) {
      if (isMatchLogin) {
        navigate('/');
      }
    } else if (!isMatchLogin) {
      navigate('/login');

      notifications.show({
        id: 'not-logged-in', // dedupe notifications
        color: 'red',
        message: 'You have not logged in yet!',
        withCloseButton: true
      });
    }
  }, [isMatchLogin, navigate, token]);

  return (
    <SetTokenContext.Provider value={setToken}>
      <TokenContext.Provider value={token}>
        {children}
      </TokenContext.Provider>
    </SetTokenContext.Provider>
  );
};
