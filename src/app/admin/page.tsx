import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCents } from '@/lib/pricing';
import AdminLoginForm from '@/components/AdminLoginForm';
import SessionCard from '@/components/SessionCard';
import { adminLogout } from './actions';
import type { Session } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Admin | ParkGive' };

async function getDashboardData() {
  try {
    const supabase = createServerSupabaseClient();

    // Lazily expire sessions past their end_time
    await supabase
      .from('sessions')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('end_time', new Date().toISOString());

    const [{ data: active }, { data: recent }, { data: totalsData }] = await Promise.all([
      supabase
        .from('sessions')
        .select('*')
        .eq('status', 'active')
        .order('end_time', { ascending: true }),

      supabase
        .from('sessions')
        .select('*')
        .neq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50),

      supabase
        .from('sessions')
        .select('parking_amount_cents, donation_amount_cents')
        .neq('status', 'pending'),
    ]);

    const totalRaisedCents = (totalsData ?? []).reduce(
      (sum, s) => sum + s.parking_amount_cents + s.donation_amount_cents,
      0
    );
    const totalDonationCents = (totalsData ?? []).reduce(
      (sum, s) => sum + s.donation_amount_cents,
      0
    );

    return {
      activeSessions:   (active  ?? []) as Session[],
      recentSessions:   (recent  ?? []) as Session[],
      totalRaisedCents,
      totalDonationCents,
      totalSessions: totalsData?.length ?? 0,
    };
  } catch {
    return {
      activeSessions:    [],
      recentSessions:    [],
      totalRaisedCents:  0,
      totalDonationCents: 0,
      totalSessions:     0,
    };
  }
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get('admin_authed')?.value === 'true';

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-4xl">🅿️</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">ParkGive Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to view the dashboard</p>
          </div>
          <AdminLoginForm />
        </div>
      </div>
    );
  }

  const {
    activeSessions,
    recentSessions,
    totalRaisedCents,
    totalDonationCents,
    totalSessions,
  } = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">🅿️</span>
          <span className="text-lg font-bold text-emerald-600">ParkGive</span>
          <span className="text-gray-400 text-sm">· Admin</span>
        </div>
        <form action={adminLogout}>
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </form>
      </header>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-gray-500 text-sm">Total Raised</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {formatCents(totalRaisedCents)}
            </p>
            {totalDonationCents > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                incl. {formatCents(totalDonationCents)} in donations
              </p>
            )}
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-gray-500 text-sm">Total Sessions</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalSessions}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-gray-500 text-sm">Active Now</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{activeSessions.length}</p>
          </div>
        </div>

        {/* Active sessions */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            Active Sessions
            {activeSessions.length > 0 && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {activeSessions.length}
              </span>
            )}
          </h2>
          {activeSessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100 text-sm">
              No active sessions right now
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </section>

        {/* Recent history */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4">Recent Sessions</h2>
          {recentSessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100 text-sm">
              No completed sessions yet
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-4 py-3 text-gray-500 font-medium">Plate</th>
                      <th className="px-4 py-3 text-gray-500 font-medium">Duration</th>
                      <th className="px-4 py-3 text-gray-500 font-medium">Amount</th>
                      <th className="px-4 py-3 text-gray-500 font-medium">Status</th>
                      <th className="px-4 py-3 text-gray-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentSessions.map((session) => (
                      <tr key={session.id}>
                        <td className="px-4 py-3 font-mono font-bold text-gray-900 tracking-wider">
                          {session.license_plate}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {session.duration_hours === 24 ? 'All Day' : `${session.duration_hours}hr`}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatCents(session.parking_amount_cents + session.donation_amount_cents)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              session.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : session.status === 'expired'
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {session.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                          {format(new Date(session.created_at), 'MMM d, h:mm a')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
