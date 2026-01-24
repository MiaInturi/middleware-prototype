import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { API_ORIGIN, COOKIES } from '../../../src/utils/constants';

const decodeTokenPayload = (token: string) => {
  const [, payload] = token.split('.');
  return JSON.parse(atob(payload)) as { exp: number };
};

const fetchAuth = async (request: NextRequest) => {
  const url = new URL('/api/auth', API_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  return fetch(url.toString(), {
    method: 'POST',
    headers,
    redirect: 'manual',
    body: request.body,
    // @ts-expect-error - TODO: fix this
    duplex: 'half'
  });
};

const handler = async (request: NextRequest) => {
  const response = await fetchAuth(request);

  const token = await response.text();
  const payload = decodeTokenPayload(token);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxAge = Math.max(payload.exp - nowSeconds, 0);

  const nextResponse = NextResponse.json(token, { status: response.status });
  nextResponse.cookies.set({
    name: COOKIES.AUTH,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge
  });

  return nextResponse;
};

export { handler as POST };
