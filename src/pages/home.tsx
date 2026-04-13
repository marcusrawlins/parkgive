/** @jsxImportSource hono/jsx */
import { Layout } from './layout';

interface Props {
  totalCents: number;
}

export function HomePage({ totalCents }: Props) {
  return (
    <Layout>
      <div class="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header class="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🅿️</span>
            <span class="text-xl font-bold text-emerald-600">ParkGive</span>
          </div>
          <a href="/admin" class="text-sm text-gray-400 hover:text-gray-600 transition-colors">Admin</a>
        </header>

        {/* Hero */}
        <section class="bg-emerald-600 text-white px-6 py-16 text-center">
          <div class="max-w-sm mx-auto">
            <p class="text-emerald-200 text-sm font-medium uppercase tracking-widest mb-4">
              Parking · Purpose · Community
            </p>
            <h1 class="text-5xl font-bold mb-3 leading-tight">Park with<br />Purpose.</h1>
            <p class="text-emerald-100 mb-2 text-lg">Pay to park. Support the youth.</p>
            <p class="text-emerald-200 text-sm mb-10">
              Every parking fee goes directly to support youth programs at the church next door.
            </p>
            {totalCents > 0 && (
              <div class="inline-block bg-white/10 rounded-2xl px-6 py-4 mb-8">
                <p class="text-emerald-200 text-xs uppercase tracking-widest mb-1">Total raised for youth programs</p>
                <p class="text-3xl font-bold">${(totalCents / 100).toFixed(2)}</p>
              </div>
            )}
            <a href="/park" class="block w-full max-w-xs mx-auto bg-white text-emerald-700 font-bold text-lg py-4 px-8 rounded-2xl shadow-lg hover:bg-emerald-50 transition-all">
              Pay to Park →
            </a>
            <p class="text-emerald-300 text-xs mt-4">No account needed · Takes 60 seconds</p>
          </div>
        </section>

        {/* Rates */}
        <section class="px-6 py-10 max-w-md mx-auto w-full">
          <h2 class="text-lg font-bold text-gray-900 mb-4 text-center">Parking Rates</h2>
          <div class="grid grid-cols-2 gap-3">
            {([
              { label: '1 Hour',  price: '$2.00' },
              { label: '2 Hours', price: '$4.00' },
              { label: '4 Hours', price: '$8.00' },
              { label: 'All Day', price: '$10.00', note: 'max' },
            ] as { label: string; price: string; note?: string }[]).map(({ label, price, note }) => (
              <div class="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <p class="text-gray-500 text-xs mb-1">{label}</p>
                <p class="text-2xl font-bold text-gray-900">
                  {price}{note && <span class="text-xs font-normal text-gray-400 ml-1">{note}</span>}
                </p>
              </div>
            ))}
          </div>
          <p class="text-center text-gray-400 text-xs mt-3">+ credit card processing fee</p>
        </section>

        {/* How it works */}
        <section class="px-6 pb-10 max-w-md mx-auto w-full">
          <h2 class="text-lg font-bold text-gray-900 mb-4">How it works</h2>
          <div class="space-y-4">
            {[
              { step: '1', text: 'Enter your license plate and choose a parking duration.' },
              { step: '2', text: 'Pay securely with your credit card, Apple Pay, or Google Pay.' },
              { step: '3', text: 'Get a confirmation page with a live countdown timer.' },
            ].map(({ step, text }) => (
              <div class="flex items-start gap-3">
                <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">{step}</div>
                <p class="text-gray-600 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer class="mt-auto px-6 py-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>ParkGive is an independent parking payment platform.</p>
          <p class="mt-1">All parking proceeds benefit the local church youth program.</p>
        </footer>
      </div>
    </Layout>
  );
}
