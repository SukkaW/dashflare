export class HTTPError extends Error {
  data: unknown;
  status: number;
  constructor(message: string, data: unknown, status: number) {
    super(message);
    this.data = data;
    this.status = status;
  }
}

export const fetcherWithAuthorization = async <T>([key, token]: [string, string], options?: RequestInit): Promise<T> => {
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  if (options?.headers) {
    const incomingHeaders = new Headers(options.headers);
    incomingHeaders.forEach((value, key) => headers.append(key, value));
  }

  const res = await fetch(
    new URL(key, new URL('/api/', window.location.href)),
    { ...options, headers }
  );

  const data = await (
    res.headers.get('content-type')?.includes('application/json')
      ? res.json()
      : res.text()
  );

  if (!res.ok) {
    // Attach extra info to the error object.
    throw new HTTPError('An error occurred while fetching the data.', data, res.status);
  }
  return data;
};
