'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  id: string;
}

/**
 * Shown immediately after Stripe redirects back with ?payment=success.
 * Polls by calling router.refresh() every 3 seconds (up to 10 attempts / 30s)
 * until the server component re-fetches and finds status = 'active'.
 */
export default function SessionPoller({ id }: Props) {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(() => {
      attempts++;
      router.refresh();
      if (attempts >= maxAttempts) clearInterval(interval);
    }, 3000);

    // Also try immediately after a short delay
    const immediate = setTimeout(() => router.refresh(), 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(immediate);
    };
  }, [id, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-6">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirming your payment…</h1>
        <p className="text-gray-500 text-sm mb-8">This usually takes just a moment.</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
        <p className="text-gray-400 text-xs mt-8">Please don&apos;t close this page</p>
      </div>
    </div>
  );
}
