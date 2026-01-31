import type { FlatMockServerConfig } from 'mock-config-server';

import { sign } from 'jsonwebtoken';

import { COOKIES } from './src/utils/constants/cookies';

const ACCESS_TTL_SECONDS = 600;
const REFRESH_TTL_SECONDS = 3600;

const createToken = (ttlSeconds: number) => {
  const payload = { exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  return sign(payload, 'secret');
};

const mockConfig: FlatMockServerConfig = [
  {
    baseUrl: '/api',
    configs: [
      {
        path: '/auth',
        method: 'post',
        routes: [
          {
            data: null,
            interceptors: {
              // important:
              // problems with typification because of lib types
              response: (
                data: unknown,
                { setCookie }: { setCookie: (name: string, value: string) => void }
              ) => {
                const accessToken = createToken(ACCESS_TTL_SECONDS);
                const refreshToken = createToken(REFRESH_TTL_SECONDS);
                setCookie(COOKIES.ACCESS, accessToken);
                setCookie(COOKIES.REFRESH, refreshToken);
                return data;
              }
            }
          }
        ]
      },
      {
        path: '/auth/refresh',
        method: 'post',
        routes: [
          {
            data: null,
            // important:
            // problems with typification because of lib types
            interceptors: {
              response: (
                data: unknown,
                { setCookie }: { setCookie: (name: string, value: string) => void }
              ) => {
                const accessToken = createToken(ACCESS_TTL_SECONDS);
                const refreshToken = createToken(REFRESH_TTL_SECONDS);
                setCookie(COOKIES.ACCESS, accessToken);
                setCookie(COOKIES.REFRESH, refreshToken);
                return data;
              }
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
