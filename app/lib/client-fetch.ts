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

const refreshTokens = async () => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  });

  return response.ok;
};

export async function clientFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const response = await fetch(input, {
    ...init,
    credentials: init.credentials ?? 'include'
  });

  if (response.ok) {
    return response;
  }

  if (response.status !== 401) {
    throw new HttpError(response);
  }

  const refreshed = await refreshTokens();
  if (!refreshed) {
    throw new HttpError(response);
  }

  const retryResponse = await fetch(input, {
    ...init,
    credentials: init.credentials ?? 'include'
  });

  if (!retryResponse.ok) {
    throw new HttpError(retryResponse);
  }

  return retryResponse;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof HttpError && error.status === 401;
}
