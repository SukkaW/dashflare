import { notifications } from '@mantine/notifications';
import { isCloudflareAPIResponseError } from './cloudflare/types';

export class HTTPError extends Error {
  data: unknown;
  status: number;
  constructor(message: string, data: unknown, status: number) {
    super(message);
    this.data = data;
    this.status = status;
  }
}

export const buildApiEndpoint = (key: string) => {
  return new URL(key, process.env.CLOUDFLARE_API_ENDPOINT || new URL('/_sukka/api/', window.location.href));
};

export const buildRequestInitWithToken = (token: string, init?: RequestInit): RequestInit => {
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  if (init?.headers) {
    const incomingHeaders = new Headers(init.headers);
    incomingHeaders.forEach((value, key) => headers.append(key, value));
  }

  return { ...init, headers };
};

export const fetcherWithAuthorization = async <T>([key, token]: [string, string], options?: RequestInit): Promise<T> => {
  const res = await fetch(
    buildApiEndpoint(key),
    buildRequestInitWithToken(token, options)
  );

  const data = await (
    res.headers.get('content-type')?.includes('application/json')
      ? res.json()
      : res.text()
  );

  if (!res.ok || ('success' in data && data.success !== true)) {
    // Attach extra info to the error object.
    throw new HTTPError('An error occurred while fetching the data.', data, res.status);
  }

  return data;
};

export const fetcherWithAuthorizationAndPagination = async <T>([key, token, pageIndex, perPage]: [string, string, number?, number?], options?: RequestInit): Promise<T> => {
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

  if (!res.ok || ('success' in data && data.success !== true)) {
    // Attach extra info to the error object.
    throw new HTTPError('An error occurred while fetching the data.', data, res.status);
  }

  return data;
};

export const handleFetchError = (error: unknown, title?: string) => {
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
};
