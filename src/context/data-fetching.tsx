import { useRef } from 'react';
import { SWRConfig } from 'swr';
import type { Middleware } from 'swr';
import { type HTTPError, isHTTPError } from 'ky';
import { needLogin, isNeedLoginError } from 'sekisho';
import { TayoriProvider } from '@/lib/tayori';
import { createClient } from '@/sdk/client';
import { useToken } from './token';

function isHTTP401Error(error: unknown): error is HTTPError {
  return isHTTPError(error) && error.response.status === 401;
}

function isZodError(error: unknown): boolean {
  return (
    typeof error === 'object'
    && error !== null
    && (error as { name?: string }).name === 'ZodError'
  );
}

/**
 * tayori doesn't handle auth error and HTTP 401. We only need to append a middleware to handle them
 */
const chainErrorHandlingMiddleware: Middleware = (useSWRNext) => (key, customFetcher, config) => {
  // no matter it is tayori or other useSWR usage, we get useSWRNext return value first
  const swr = useSWRNext(key, customFetcher, config);

  // no matter if swr.error is from tayori or other useSWR usage, we handle error in the same way

  // tayori already handles zod error, but we still need to handle needLogin and HTTP 401
  // This needs to be synced with SWRConfig's onError logic
  if (isHTTP401Error(swr.error)) {
    needLogin(`${swr.error.message} (HTTP 401)`);
  } else if (
    // needLogin invoked by sdk client directly (maybe missing auth token?) should be thrown directly
    isNeedLoginError(swr.error)
    // zod error should be thrown directly as well to be caught by the React Error Boundary
    || isZodError(swr.error)
  ) {
    throw swr.error;
  }

  return swr;
};

export function DataFetchingProvider({ children }: React.PropsWithChildren) {
  const token = useToken();
  const tokenRef = useRef(token);
  tokenRef.current = token;

  return (
    <TayoriProvider
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
      })}
    >
      <SWRConfig value={{ use: [chainErrorHandlingMiddleware] }}>
        {children}
      </SWRConfig>
    </TayoriProvider>
  );
}
