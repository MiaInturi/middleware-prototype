'use client';

import { clientFetch } from '@app/lib/client-fetch';
import { useMutation } from '@tanstack/react-query';

export default function UnauthorizedClientPage() {
  const unauthorizedRequest = useMutation({
    mutationFn: async () => {
      await clientFetch('http://localhost:3000/api/unauthorized', {
        method: 'GET'
      });
    }
  });

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-6'>
      <button
        className='rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.7)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow-[0_24px_50px_-32px_rgba(15,23,42,0.55)] disabled:cursor-not-allowed disabled:opacity-60'
        disabled={unauthorizedRequest.isPending}
        type='button'
        onClick={() => unauthorizedRequest.mutate()}
      >
        {unauthorizedRequest.isPending ? 'Requesting' : 'Send Request'}
      </button>
    </div>
  );
}
