'use client';

import { clientFetch } from '@app/lib/client-fetch';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const loginRequest = useMutation({
    mutationFn: async () => {
      await clientFetch('/api/auth', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      router.push('/');
    },
    onError: (error) => {
      console.error('Auth request failed', error);
    }
  });

  const handleLogin = () => {
    if (loginRequest.isPending) {
      return;
    }

    loginRequest.mutate();
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-6'>
      <div className='w-full max-w-sm rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-[0_20px_60px_-35px_rgba(15,23,42,0.6)] backdrop-blur'>
        <p className='mb-6 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400'>
          Auth Portal
        </p>
        <button
          className='w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60'
          disabled={loginRequest.isPending}
          type='button'
          onClick={handleLogin}
        >
          {loginRequest.isPending ? 'Signing In' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
