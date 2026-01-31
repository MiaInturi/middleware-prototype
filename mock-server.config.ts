import type { FlatMockServerConfig } from 'mock-config-server';

import { sign } from 'jsonwebtoken';

import { COOKIES } from './src/utils/constants/cookies';

const ACCESS_TTL_SECONDS = 600;

const createAccessToken = (ttlSeconds: number) => {
  const payload = { exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  return sign(payload, 'secret');
};

const createRefreshToken = () => `refresh-${Math.random().toString(36).slice(2)}-${Date.now()}`;

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
                const accessToken = createAccessToken(ACCESS_TTL_SECONDS);
                const refreshToken = createRefreshToken();
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
                const accessToken = createAccessToken(ACCESS_TTL_SECONDS);
                const refreshToken = createRefreshToken();
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
