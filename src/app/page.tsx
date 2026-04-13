import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';

async function getTotalRaised(): Promise<number> {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('sessions')
      .select('parking_amount_cents, donation_amount_cents')
      .neq('status', 'pending');

    if (!data) return 0;
    return data.reduce(
      (sum, s) => sum + s.parking_amount_cents + s.donation_amount_cents,
      0
    );
  } catch {
    return 0;
  }
}

export default async function HomePage() {
  const totalCents = await getTotalRaised();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🅿️</span>
          <span className="text-xl font-bold text-emerald-600">ParkGive</span>
        </div>
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Admin
        </Link>
      </header>

      {/* Hero */}
      <section className="bg-emerald-600 text-white px-6 py-16 text-center">
        <div className="max-w-sm mx-auto">
          <p className="text-emerald-200 text-sm font-medium uppercase tracking-widest mb-4">
            Parking · Purpose · Community
          </p>
          <h1 className="text-5xl font-bold mb-3 leading-tight">
            Park&nbsp;with<br />Purpose.
          </h1>
          <p className="text-emerald-100 mb-2 text-lg">Pay to park. Support the youth.</p>
          <p className="text-emerald-200 text-sm mb-10">
            Every parking fee goes directly to support youth programs at the church next door.
          </p>

          {/* Total raised — only shown once Supabase is live */}
          {totalCents > 0 && (
            <div className="inline-block bg-white/10 rounded-2xl px-6 py-4 mb-8 backdrop-blur-sm">
              <p className="text-emerald-200 text-xs uppercase tracking-widest mb-1">
                Total raised for youth programs
              </p>
              <p className="text-3xl font-bold">${(totalCents / 100).toFixed(2)}</p>
            </div>
          )}

          <Link
            href="/park"
            className="block w-full max-w-xs mx-auto bg-white text-emerald-700 font-bold text-lg py-4 px-8 rounded-2xl shadow-lg hover:bg-emerald-50 active:scale-95 transition-all"
          >
            Pay to Park →
          </Link>
          <p className="text-emerald-300 text-xs mt-4">No account needed · Takes 60 seconds</p>
        </div>
      </section>

      {/* Rates */}
      <section className="px-6 py-10 max-w-md mx-auto w-full">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Parking Rates</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '1 Hour',  price: '$2.00' },
            { label: '2 Hours', price: '$4.00' },
            { label: '4 Hours', price: '$8.00' },
            { label: 'All Day', price: '$10.00', note: 'max' },
          ].map(({ label, price, note }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-gray-500 text-xs mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {price}
                {note && <span className="text-xs font-normal text-gray-400 ml-1">{note}</span>}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-400 text-xs mt-3">+ credit card processing fee</p>
      </section>

      {/* How it works */}
      <section className="px-6 pb-10 max-w-md mx-auto w-full">
        <h2 className="text-lg font-bold text-gray-900 mb-4">How it works</h2>
        <div className="space-y-4">
          {[
            { step: '1', text: 'Enter your license plate and choose a parking duration.' },
            { step: '2', text: 'Pay securely with your credit card, Apple Pay, or Google Pay.' },
            { step: '3', text: 'Get a confirmation page with a live countdown timer.' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                {step}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-6 border-t border-gray-100 text-center text-xs text-gray-400">
        <p>ParkGive is an independent parking payment platform.</p>
        <p className="mt-1">All parking proceeds benefit the local church youth program.</p>
      </footer>
    </div>
  );
}
