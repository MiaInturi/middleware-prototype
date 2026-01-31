## Middleware prototype

Этот репозиторий — небольшой прототип на Next.js (App Router) для демонстрации работы с cookie‑based авторизацией (access + refresh tokens), проксированием запросов и обработкой 401 в разных слоях (server/client).

## Краткая архитектура

- `/api/[[...route]]` — прокси к мок‑серверу (`mock-config-server`) на `API_ORIGIN`.
- `/api/auth` — логин и выставление access + refresh cookie.
- `/api/auth/refresh` — обновление access cookie и ротация refresh cookie.
- `/logout` — сбрасывает access + refresh cookie и редиректит на `/login`.
- `proxy.ts` — общий auth‑guard: проверка cookie, refresh токенов и редирект на `/logout` при ошибках.

## Почему нельзя мутировать response headers в server components

В Server Components нет объекта ответа, которым можно управлять. Доступны только заголовки запроса через `next/headers`, а рендеринг стримится по мере готовности. Поэтому:

- нельзя выставить `Set-Cookie` или изменить response headers внутри server component,
- нельзя корректно сделать `redirect` через изменения заголовков.

Такие операции выполняются только в route handlers или middleware. В этом проекте для server‑части используется `app/lib/server-fetch.ts`: при `401` выполняется `redirect('/logout')`, а манипуляции с cookie происходят в `app/logout/route.ts`, `app/api/auth/route.ts`, `app/api/auth/refresh/route.ts` и `proxy.ts`.

## Зачем сделан /logout handler

`/logout` — единая точка выхода, которая:

- гарантированно удаляет access + refresh cookie на сервере,
- выставляет `Cache-Control: no-store` и связанные заголовки, чтобы исключить кеширование приватных данных,
- выполняет редирект на `/login`.

Это удобно и безопасно для обоих контекстов — и для server, и для client, где нельзя напрямую «почистить» httpOnly cookie.

## Как проверить 401

В проекте есть две страницы для имитации 401:

- Клиент: `app/unauthorized-client/page.tsx` использует `clientFetch`, который пытается обновить токены при 401 и повторяет запрос; при неудачном refresh или повторном запросе кидает `HttpError`.
- Сервер: `app/unauthorized-server/page.tsx` вызывает `serverFetch`, который при 401 делает `redirect('/logout')`.

Обе страницы бьют в мок‑эндпоинт `/api/unauthorized`, который всегда возвращает 401 (см. `mock-server.config.ts`).

## Где живет обработка 401

Вынесено в `app/lib`:

- `app/lib/client-fetch.ts` — делает refresh + retry на 401, и если refresh неудачен или повторный запрос падает, выбрасывает `HttpError`, плюс хелпер `isUnauthorizedError`.
- `app/lib/server-fetch.ts` — при `401` делает `redirect('/logout')`.

На клиенте глобальная обработка 401 подключена через `app/providers.tsx` (React Query), где при ошибке выполняется `window.location.assign('/logout')`.

## Запуск

```bash
npm run dev-mock
```

Затем откройте [http://localhost:3000](http://localhost:3000) и используйте ссылки на главной странице для проверки 401 сценариев.
