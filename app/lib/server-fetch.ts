import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function serverFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headerList = await headers();
  const cookie = headerList.get('cookie');

  const mergedHeaders = new Headers(init.headers);
  if (cookie) {
    mergedHeaders.set('cookie', cookie);
  }

  const response = await fetch(input, {
    ...init,
    headers: mergedHeaders
  });

  if (response.status === 401) {
    redirect('/logout');
  }

  return response;
}
