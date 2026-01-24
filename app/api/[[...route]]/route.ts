import type { NextRequest } from 'next/server';

import { API_ORIGIN } from '../../../src/utils/constants';

const handler = async (
  request: NextRequest,
  context: { params: Promise<{ route?: string[] }> }
) => {
  const resolvedParams = await context.params;
  const route = resolvedParams.route ?? [];
  const path = route.length > 0 ? `/${route.join('/')}` : '';
  const url = new URL(`/api${path}`, API_ORIGIN);
  url.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual'
  };

  if (hasBody) {
    init.body = request.body;
    (init as RequestInit & { duplex: 'half' }).duplex = 'half';
  }

  const response = await fetch(url.toString(), init);
  return response;
};

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT
};
