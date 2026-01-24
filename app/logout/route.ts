import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { COOKIES } from '../../src/utils/constants';

const handler = (request: NextRequest) => {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.set({
    name: COOKIES.AUTH,
    value: '',
    path: '/',
    maxAge: 0
  });
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
};

export { handler as GET };
