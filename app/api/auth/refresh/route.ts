import type { NextRequest } from 'next/server';

import { API_ORIGIN } from '../../../../src/utils/constants';

const fetchRefresh = async (request: NextRequest) => {
  const url = new URL('/api/auth/refresh', API_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  return fetch(url.toString(), {
    method: 'POST',
    headers,
    redirect: 'manual',
    body: request.body,
    duplex: 'half'
  } as RequestInit & { duplex: 'half' });
};

const handler = async (request: NextRequest) => {
  const response = await fetchRefresh(request);
  return response;
};

export { handler as POST };
