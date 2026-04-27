import { useCallback, useRef } from 'react';
import { TayoriProvider } from '@/lib/tayori';
import { createClient } from '@/sdk/client';
import { useToken } from './token';

export function DataFetchingProvider({ children }: React.PropsWithChildren) {
  const token = useToken();
  const tokenRef = useRef(token);
  tokenRef.current = token;

  return <TayoriProvider
    initClient={() => createClient({
      baseUrl: 'https://api.cloudflare.com/client/v4',
      throwOnError: true,
      kyOptions: {
        hooks: {
          beforeRequest: [
            (request) => {
              const token = tokenRef.current;
              if (token) {
                request.headers.set('Authorization', `Bearer ${token}`);
              }
            }
          ]
        }
      }
      // auth: () => tokenRef.current ?? undefined,
    })}
  >
    {children}
  </TayoriProvider>;
}
