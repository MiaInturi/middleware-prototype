'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { isUnauthorizedError } from './lib/client-fetch';

const handleRequestError = (error: unknown) => {
  if (isUnauthorizedError(error)) {
    window.location.assign('/logout');
  }
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleRequestError
        }),
        mutationCache: new MutationCache({
          onError: handleRequestError
        })
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
