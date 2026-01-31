import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import setCookieParser from 'set-cookie-parser';

import { COOKIES } from './src/utils/constants';

export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(COOKIES.REFRESH)?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname === '/login') {
    if (refreshToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/logout', request.url));
  }

  try {
    const refreshResponse = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: { cookie: request.headers.get('cookie') ?? '' }
    });
    if (!refreshResponse.ok) {
      console.error('Failed to refresh auth cookies', refreshResponse.status);
      return NextResponse.redirect(new URL('/logout', request.url));
    }

    const setCookieHeader = refreshResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      console.error('Failed to get refreshed auth cookies');
      return NextResponse.redirect(new URL('/logout', request.url));
    }

    const parsedCookies = setCookieParser.parse(setCookieHeader);
    for (const cookie of parsedCookies) {
      request.cookies.set(cookie.name, cookie.value);
    }

    const response = NextResponse.next();
    response.headers.set('Set-Cookie', setCookieHeader);
    return response;
  } catch (error) {
    console.error('Failed to refresh auth cookies', error);
    return NextResponse.redirect(new URL('/logout', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - logout (logout route)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml, manifest.webmanifest (metadata files)
     * - asset file extensions (css/js/images/fonts/etc)
     *
     * Note: _next/data is still matched for auth checks.
     */
    '/((?!api|_next/static|_next/image|logout|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\.(?:css|js|mjs|cjs|map|png|jpg|jpeg|gif|svg|webp|ico|txt|xml|json|woff|woff2|ttf|eot|otf|pdf|zip|gz|br)$).*)'
  ]
};
