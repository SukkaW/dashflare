import { notifications } from '@mantine/notifications';
import { isCloudflareAPIResponseError } from './cloudflare/types';
import { useSyncExternalStore } from 'react';

let cloudflareApiRequestTimestamps: number[] = [];
const cloudflareApiRateLimitListener = new Set<() => void>();
function subscribeToCloudflareApiRateLimit(lisener: () => void) {
  cloudflareApiRateLimitListener.add(lisener);
  return () => cloudflareApiRateLimitListener.delete(lisener);
}
function addOneToCloudflareApiRateLimit() {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  const currentCallTimesCount = cloudflareApiRequestTimestamps.push(now);
  cloudflareApiRequestTimestamps = cloudflareApiRequestTimestamps.filter((t) => t >= fiveMinutesAgo);
  const newCallTimesCount = cloudflareApiRequestTimestamps.length;

  if (currentCallTimesCount !== newCallTimesCount) {
    cloudflareApiRateLimitListener.forEach((lisener) => lisener());
  }
}

const getRemainingCloudflareApiRateLimit = () => cloudflareApiRequestTimestamps.length;

export function useCloudflareApiRateLimit() {
  return useSyncExternalStore(
    subscribeToCloudflareApiRateLimit,
    getRemainingCloudflareApiRateLimit
  );
}

export class HTTPError extends Error {
  data: unknown;
  status: number;
  name = 'HTTPError';
  constructor(message: string, data: unknown, status: number) {
    super(message);
    this.data = data;
    this.status = status;
  }
}

export const buildApiEndpoint = (key: string) => new URL(key, process.env.CLOUDFLARE_API_ENDPOINT || new URL('/_sukka/api/', window.location.href));

export function buildRequestInitWithToken(token: string, init?: RequestInit): RequestInit {
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  if (init?.headers) {
    const incomingHeaders = new Headers(init.headers);
    incomingHeaders.forEach((value, key) => headers.append(key, value));
  }

  return { ...init, headers };
}

export async function fetcherWithAuthorization<T = unknown>([key, token]: [string, string], options?: RequestInit): Promise<T> {
  addOneToCloudflareApiRateLimit();

  const res = await fetch(
    buildApiEndpoint(key),
    buildRequestInitWithToken(token, options)
  );

  const data = await (
    res.headers.get('content-type')?.includes('application/json')
      ? res.json()
      : res.text()
  );

  if (!res.ok || (typeof data === 'object' && data && 'success' in data && data.success !== true)) {
    // Attach extra info to the error object.
    throw new HTTPError('An error occurred while fetching the data.', data, res.status);
  }

  return data as T;
}

export async function fetcherWithAuthorizationAndPagination<T = any>([key, token, pageIndex, perPage]: [string, string, number?, number?], options?: RequestInit): Promise<T> {
  addOneToCloudflareApiRateLimit();

  const url = buildApiEndpoint(key);
  if (typeof pageIndex === 'number' && pageIndex >= 1) {
    url.searchParams.set('page', String(pageIndex));
  }
  if (typeof perPage === 'number' && perPage >= 1) {
    url.searchParams.set('per_page', String(perPage));
  }

  const res = await fetch(
    url,
    buildRequestInitWithToken(token, options)
  );

  const data = await (
    res.headers.get('content-type')?.includes('application/json')
      ? res.json()
      : res.text()
  );

  if (!res.ok || (typeof data === 'object' && data && 'success' in data && data.success !== true)) {
    // Attach extra info to the error object.
    throw new HTTPError('An error occurred while fetching the data.', data, res.status);
  }

  return data as T;
}

export function handleFetchError(error: unknown, title?: string) {
  if (error instanceof HTTPError) {
    if (isCloudflareAPIResponseError(error.data)) {
      error.data.errors.forEach((error) => {
        notifications.show({
          color: 'red',
          id: `${error.code}-${error.message}`,
          title,
          message: error.message
        });
      });

      return;
    }

    notifications.show({
      color: 'red',
      title,
      message: `HTTP Error ${error.status}, please check the console for more information.`
    });

    console.error('[HTTP Error]', error.status, error.data);
    return;
  }
  if (error instanceof Error) {
    notifications.show({
      color: 'red',
      title,
      message: `${error.name}: ${error.message}`
    });
    console.error(error);
    return;
  }

  notifications.show({
    color: 'red',
    title,
    message: 'Unknown Error, please check the console for more information'
  });
  console.error(error);
}

export function extractErrorMessage(error: unknown) {
  if (error instanceof HTTPError) {
    if (isCloudflareAPIResponseError(error.data)) {
      return error.data.errors.map((error) => error.message).join('\n');
    }

    return `HTTP Error ${error.status}, response: ${typeof error.data === 'string' ? error.data : JSON.stringify(error.data, null, 2)}`;
  }
  if (error instanceof Error) {
    return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
  }

  console.error(error);
  return 'Unknown Error, please check the console for more information';
}
