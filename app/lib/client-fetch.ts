export class HttpError extends Error {
  status: number;
  response: Response;

  constructor(response: Response) {
    super(`Request failed with status ${response.status}`);
    this.name = 'HttpError';
    this.status = response.status;
    this.response = response;
  }
}

export async function clientFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const response = await fetch(input, {
    ...init,
    credentials: init.credentials ?? 'include'
  });

  if (!response.ok) {
    throw new HttpError(response);
  }

  return response;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof HttpError && error.status === 401;
}
