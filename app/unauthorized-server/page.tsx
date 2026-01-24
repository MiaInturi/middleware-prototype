import { serverFetch } from '@app/lib/server-fetch';

export const dynamic = 'force-dynamic';

export default async function UnauthorizedServerPage() {
  await serverFetch('http://localhost:3000/api/unauthorized', {
    method: 'GET'
  });
  return null;
}
