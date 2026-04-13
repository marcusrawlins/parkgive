import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCents } from '@/lib/pricing';
import CountdownTimer from '@/components/CountdownTimer';
import SessionPoller from '@/components/SessionPoller';
import type { Session } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getSession(id: string): Promise<Session | null> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (!session) return null;

    // Lazy expiry: update status if past end_time
    if (
      session.status === 'active' &&
      session.end_time &&
      new Date(session.end_time) < new Date()
    ) {
      await supabase
        .from('sessions')
        .update({ status: 'expired' })
        .eq('id', id);
      return { ...session, status: 'expired' };
    }

    return session as Session;
  } catch {
    return null;
  }
}

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;

  const session = await getSession(id);
  if (!session) notFound();

  // Payment just completed — show spinner while webhook fires
  if (session.status === 'pending' && payment === 'success') {
    return <SessionPoller id={id} />;
  }

  const totalPaid = session.parking_amount_cents + session.donation_amount_cents;
  const durationLabel =
    session.duration_hours === 24
      ? 'All Day'
      : `${session.duration_hours} Hour${session.duration_hours > 1 ? 's' : ''}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-2 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
          <span className="text-xl">🅿️</span>
          ParkGive
        </Link>
      </header>

      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        {session.status === 'active' ? (
          <>
            {/* Active session */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">✅</div>
              <h1 className="text-2xl font-bold text-gray-900">You&apos;re parked!</h1>
              <p className="text-gray-500 text-sm mt-1">Your session is active and confirmed.</p>
            </div>

            {/* Countdown */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center mb-6 border border-gray-100">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Time Remaining</p>
              <CountdownTimer endTime={session.end_time!} />
              {session.end_time && (
                <p className="text-gray-400 text-xs mt-3">
                  Expires at {format(new Date(session.end_time), 'h:mm a, MMM d')}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="divide-y divide-gray-100 text-sm mb-8">
              <div className="flex justify-between py-3">
                <span className="text-gray-500">License Plate</span>
                <span className="font-mono font-bold text-gray-900 tracking-wider">
                  {session.license_plate}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-500">Duration</span>
                <span className="text-gray-900">{durationLabel}</span>
              </div>
              {session.start_time && (
                <div className="flex justify-between py-3">
                  <span className="text-gray-500">Started</span>
                  <span className="text-gray-900">
                    {format(new Date(session.start_time), 'h:mm a')}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3">
                <span className="text-gray-500">Amount Paid</span>
                <span className="text-gray-900">{formatCents(totalPaid)}</span>
              </div>
              {session.donation_amount_cents > 0 && (
                <div className="flex justify-between py-3">
                  <span className="text-gray-500">Your Donation</span>
                  <span className="text-emerald-600 font-medium">
                    {formatCents(session.donation_amount_cents)} ❤️
                  </span>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-gray-400">
              Thank you! Parking proceeds support the local youth program.
            </p>
          </>
        ) : session.status === 'expired' ? (
          /* Expired session */
          <div className="text-center py-8">
            <div className="text-5xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h1>
            <p className="text-gray-500 mb-6">Your parking session has ended.</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 mb-8 inline-block">
              <p className="font-mono font-bold text-gray-900 text-lg mb-1">
                {session.license_plate}
              </p>
              <p>
                {durationLabel} · {formatCents(session.parking_amount_cents)}
              </p>
            </div>
            <div>
              <Link
                href="/park"
                className="inline-block bg-emerald-600 text-white font-bold py-3 px-8 rounded-2xl hover:bg-emerald-700 transition-colors"
              >
                Park Again
              </Link>
            </div>
          </div>
        ) : (
          /* Pending / unconfirmed */
          <div className="text-center py-8">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Not Confirmed</h1>
            <p className="text-gray-500 mb-6">
              Please complete payment to activate your parking session.
            </p>
            <Link
              href="/park"
              className="inline-block bg-emerald-600 text-white font-bold py-3 px-8 rounded-2xl hover:bg-emerald-700 transition-colors"
            >
              Start Over
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
