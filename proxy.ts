import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { COOKIES } from './src/utils/constants';

export async function proxy(request: NextRequest) {
  const authCookieValue = request.cookies.get(COOKIES.AUTH)?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname === '/login') {
    if (authCookieValue) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!authCookieValue) {
    return NextResponse.redirect(new URL('/logout', request.url));
  }

  try {
    const [, payload] = authCookieValue.split('.');
    const { exp } = JSON.parse(atob(payload)) as { exp: number };

    // ✅ important:
    // We either can update cookie by expiration time or always refresh it
    const timeBeforeExpiration = exp - Math.floor(Date.now() / 1000);
    if (timeBeforeExpiration >= 300) {
      return NextResponse.next();
    }

    const refreshResponse = await fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: { cookie: request.headers.get('cookie') ?? '' }
    });
    if (!refreshResponse.ok) {
      console.error('Failed to refresh auth cookie', refreshResponse.status);
      return NextResponse.redirect(new URL('/logout', request.url));
    }

    const newAuthCookieValue = refreshResponse.headers
      .get('Set-Cookie')
      ?.split(';')[0]
      ?.split('=')
      ?.slice(1)
      .join('=');
    if (!newAuthCookieValue) {
      console.error('Failed to get new auth cookie value');
      return NextResponse.redirect(new URL('/logout', request.url));
    }

    request.cookies.set(COOKIES.AUTH, newAuthCookieValue);
    const response = NextResponse.next();
    response.cookies.set(COOKIES.AUTH, newAuthCookieValue);
    return response;
  } catch (error) {
    console.error('Failed to check JWT expiration', error);
    return NextResponse.redirect(new URL('/logout', request.url));
  }
}

export const config = {
  // TODO logout into separate route
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
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
