import type { FlatMockServerConfig } from 'mock-config-server';

import { sign } from 'jsonwebtoken';

const mockConfig: FlatMockServerConfig = [
  {
    baseUrl: '/api',
    configs: [
      {
        path: '/auth',
        method: 'post',
        routes: [
          {
            data: () => {
              // ✅ important:
              // Token with 10 minutes expiration
              const payload = { exp: Math.floor(Date.now() / 1000) + 600 };
              const token = sign(payload, 'secret');
              return token;
            }
          }
        ]
      },
      {
        path: '/unauthorized',
        method: 'get',
        routes: [
          {
            data: null,
            settings: {
              status: 401
            }
          }
        ]
      }
    ]
  }
];

export default mockConfig;
