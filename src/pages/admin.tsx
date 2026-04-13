/** @jsxImportSource hono/jsx */
import { Layout, ParkGiveLogo } from './layout';
import type { Session } from '../lib/types';
import { formatCents } from '../lib/pricing';

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function minutesLeft(endTime: string | null): number | null {
  if (!endTime) return null;
  return Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 60000));
}

function timeLeftLabel(mins: number): string {
  if (mins === 0) return 'Expiring';
  if (mins > 60) return `${Math.floor(mins / 60)}h ${mins % 60}m left`;
  return `${mins}m left`;
}

function durationLabel(h: number) {
  return h === 24 ? 'All Day' : `${h}hr`;
}

/* ─── Login page ─── */
export function AdminLoginPage({ error }: { error?: string }) {
  return (
    <Layout title="Admin | ParkGive">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div class="w-full max-w-sm">
          <div class="text-center mb-8">
            <ParkGiveLogo size="lg" />
            <h1 class="text-xl font-bold text-gray-900 mt-4">Admin Dashboard</h1>
            <p class="text-gray-500 text-sm mt-1">Sign in to view the dashboard</p>
          </div>
          <form method="post" action="/admin/login" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              autofocus
              placeholder="Enter admin password"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand mb-4"
            />
            {error && (
              <p class="text-red-600 text-sm mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <button type="submit" class="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

/* ─── Dashboard ─── */
interface DashboardProps {
  activeSessions: Session[];
  recentSessions: Session[];
  totalRaisedCents: number;
  totalDonationCents: number;
  totalSessions: number;
}

export function AdminDashboard({
  activeSessions, recentSessions,
  totalRaisedCents, totalDonationCents, totalSessions,
}: DashboardProps) {
  return (
    <Layout title="Admin Dashboard | ParkGive">
      <div class="min-h-screen bg-gray-50">
        {/* Header */}
        <header class="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div class="flex items-center gap-2">
            <ParkGiveLogo size="md" />
            <span class="text-gray-400 text-sm">· Admin</span>
          </div>
          <form method="post" action="/admin/logout">
            <button type="submit" class="text-sm text-gray-500 hover:text-gray-700 transition-colors">Sign out</button>
          </form>
        </header>

        <div class="px-6 py-8 max-w-4xl mx-auto">
          {/* Summary cards */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div class="bg-white rounded-2xl p-5 border border-gray-100">
              <p class="text-gray-500 text-sm">Total Raised</p>
              <p class="text-3xl font-bold text-brand mt-1">{formatCents(totalRaisedCents)}</p>
              {totalDonationCents > 0 && (
                <p class="text-xs text-gray-400 mt-1">incl. {formatCents(totalDonationCents)} in donations</p>
              )}
            </div>
            <div class="bg-white rounded-2xl p-5 border border-gray-100">
              <p class="text-gray-500 text-sm">Total Sessions</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{totalSessions}</p>
            </div>
            <div class="bg-white rounded-2xl p-5 border border-gray-100">
              <p class="text-gray-500 text-sm">Active Now</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{activeSessions.length}</p>
            </div>
          </div>

          {/* Active sessions */}
          <section class="mb-8">
            <h2 class="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              Active Sessions
              {activeSessions.length > 0 && (
                <span class="text-xs font-medium text-brand-dark bg-brand-light px-2 py-0.5 rounded-full">
                  {activeSessions.length}
                </span>
              )}
            </h2>
            {activeSessions.length === 0 ? (
              <div class="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100 text-sm">
                No active sessions right now
              </div>
            ) : (
              <div class="space-y-3">
                {activeSessions.map((s) => {
                  const mins = minutesLeft(s.end_time);
                  const color = mins === null ? 'text-gray-400' : mins > 30 ? 'text-brand' : mins > 10 ? 'text-yellow-500' : 'text-red-500';
                  return (
                    <div class="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                      <div>
                        <span class="font-mono font-bold text-gray-900 text-lg tracking-wider">{s.license_plate}</span>
                        <span class="text-gray-400 text-sm ml-2">{durationLabel(s.duration_hours)}</span>
                      </div>
                      <div class="text-right">
                        {mins !== null && <p class={`font-bold text-sm ${color}`}>{timeLeftLabel(mins)}</p>}
                        <p class="text-gray-400 text-xs">{formatCents(s.parking_amount_cents + s.donation_amount_cents)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent sessions */}
          <section>
            <h2 class="text-base font-bold text-gray-900 mb-4">Recent Sessions</h2>
            {recentSessions.length === 0 ? (
              <div class="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100 text-sm">
                No completed sessions yet
              </div>
            ) : (
              <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-gray-100 text-left">
                        <th class="px-4 py-3 text-gray-500 font-medium">Plate</th>
                        <th class="px-4 py-3 text-gray-500 font-medium">Duration</th>
                        <th class="px-4 py-3 text-gray-500 font-medium">Amount</th>
                        <th class="px-4 py-3 text-gray-500 font-medium">Status</th>
                        <th class="px-4 py-3 text-gray-500 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      {recentSessions.map((s) => (
                        <tr>
                          <td class="px-4 py-3 font-mono font-bold text-gray-900 tracking-wider">{s.license_plate}</td>
                          <td class="px-4 py-3 text-gray-600">{durationLabel(s.duration_hours)}</td>
                          <td class="px-4 py-3 text-gray-600">{formatCents(s.parking_amount_cents + s.donation_amount_cents)}</td>
                          <td class="px-4 py-3">
                            <span class={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.status === 'active'  ? 'bg-brand-light text-brand-dark' :
                              s.status === 'expired' ? 'bg-gray-100 text-gray-500' :
                                                       'bg-yellow-100 text-yellow-700'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td class="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDateTime(s.created_at)}</td>
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
    </Layout>
  );
}
