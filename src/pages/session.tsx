/** @jsxImportSource hono/jsx */
import { Layout, ParkGiveLogo } from './layout';
import type { Session, Zone } from '../lib/types';
import { formatCents } from '../lib/pricing';

/* ─── Countdown timer script ─── */
const TIMER_SCRIPT = `
(function () {
  var el = document.getElementById('countdown');
  var endTime = new Date(el.dataset.endtime);
  function tick() {
    var diff = Math.max(0, Math.floor((endTime - new Date()) / 1000));
    if (diff === 0) {
      el.textContent = 'Session Expired';
      el.className = 'text-red-500 text-4xl font-mono font-bold';
      return;
    }
    var h = Math.floor(diff / 3600);
    var m = Math.floor((diff % 3600) / 60);
    var s = diff % 60;
    el.textContent =
      String(h).padStart(2,'0') + ':' +
      String(m).padStart(2,'0') + ':' +
      String(s).padStart(2,'0');
    el.className = diff > 1800
      ? 'text-brand text-5xl font-mono font-bold tabular-nums'
      : diff > 600
        ? 'text-yellow-500 text-5xl font-mono font-bold tabular-nums'
        : 'text-red-500   text-5xl font-mono font-bold tabular-nums';
  }
  tick();
  setInterval(tick, 1000);
})();
`;

/* ─── Session poller (pending → active) ─── */
function pollerScript(id: string) {
  return `
(function () {
  var id = '${id}', attempts = 0;
  setTimeout(poll, 1500);
  var iv = setInterval(poll, 3000);
  async function poll() {
    attempts++;
    try {
      var r = await fetch('/api/session/' + id + '/status');
      var d = await r.json();
      if (d.status === 'active') { clearInterval(iv); location.reload(); return; }
    } catch(e) {}
    if (attempts >= 10) { clearInterval(iv); location.reload(); }
  }
})();
`;
}

/* ─── Format helpers ─── */
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function durationLabel(h: number) {
  return h === 24 ? 'All Day' : `${h} Hour${h > 1 ? 's' : ''}`;
}

/* ─── Page ─── */
interface Props {
  session: Session;
  zone: Zone | null;
  payment?: string;
}

export function SessionPage({ session, zone, payment }: Props) {
  const isPendingAfterPayment = session.status === 'pending' && payment === 'success';
  const totalPaid = session.parking_amount_cents + session.donation_amount_cents;

  return (
    <Layout title="Parking Confirmation | ParkGive">
      <div class="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header class="px-6 py-4 flex items-center gap-2 border-b border-gray-100">
          <a href="/" class="flex items-center gap-2">
            <ParkGiveLogo size="md" />
          </a>
        </header>

        {/* Zone banner */}
        {zone && (
          <div class="bg-brand-light border-b border-brand-soft px-6 py-3">
            <div class="max-w-md mx-auto flex items-center gap-3">
              <div class="flex-shrink-0 w-9 h-9 rounded-lg bg-brand text-white flex flex-col items-center justify-center">
                <span class="text-white text-xs font-bold leading-none">{zone.id.split('-')[0]}</span>
                <span class="text-white font-extrabold text-sm leading-none">{zone.id.split('-')[1]}</span>
              </div>
              <div>
                <span class="font-semibold text-brand-dark text-sm">{zone.name}</span>
                <span class="text-brand-muted text-xs ml-2">{zone.address}</span>
              </div>
            </div>
          </div>
        )}

        <div class="flex-1 px-6 py-8 max-w-md mx-auto w-full">
          {isPendingAfterPayment ? (
            /* ── Polling state ── */
            <div class="text-center py-12">
              <div class="text-5xl mb-6">⏳</div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Confirming your payment…</h1>
              <p class="text-gray-500 text-sm mb-8">This usually takes just a moment.</p>
              <div class="flex justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
              </div>
              <p class="text-gray-400 text-xs mt-8">Please don't close this page</p>
            </div>
          ) : session.status === 'active' ? (
            /* ── Active session ── */
            <>
              <div class="text-center mb-8">
                <div class="text-5xl mb-3">✅</div>
                <h1 class="text-2xl font-bold text-gray-900">You're parked!</h1>
                <p class="text-gray-500 text-sm mt-1">Your session is confirmed.</p>
              </div>

              {/* Timer */}
              <div class="bg-gray-50 rounded-2xl p-6 text-center mb-6 border border-gray-100">
                <p class="text-gray-400 text-xs uppercase tracking-widest mb-3">Time Remaining</p>
                <div
                  id="countdown"
                  data-endtime={session.end_time!}
                  class="text-5xl font-mono font-bold text-brand tabular-nums"
                >
                  --:--:--
                </div>
                {session.end_time && (
                  <p class="text-gray-400 text-xs mt-3">
                    Expires at {fmtTime(session.end_time)}
                  </p>
                )}
              </div>

              {/* Details */}
              <div class="divide-y divide-gray-100 text-sm mb-8">
                <div class="flex justify-between py-3">
                  <span class="text-gray-500">License Plate</span>
                  <span class="font-mono font-bold text-gray-900 tracking-wider">{session.license_plate}</span>
                </div>
                <div class="flex justify-between py-3">
                  <span class="text-gray-500">Duration</span>
                  <span class="text-gray-900">{durationLabel(session.duration_hours)}</span>
                </div>
                {session.start_time && (
                  <div class="flex justify-between py-3">
                    <span class="text-gray-500">Started</span>
                    <span class="text-gray-900">{fmtTime(session.start_time)}</span>
                  </div>
                )}
                <div class="flex justify-between py-3">
                  <span class="text-gray-500">Amount Paid</span>
                  <span class="text-gray-900">{formatCents(totalPaid)}</span>
                </div>
                {session.donation_amount_cents > 0 && (
                  <div class="flex justify-between py-3">
                    <span class="text-gray-500">Your Donation</span>
                    <span class="font-medium" style="color:#78B340">{formatCents(session.donation_amount_cents)} <span style="color:#F5922F">♥</span></span>
                  </div>
                )}
              </div>
              <p class="text-center text-xs text-gray-400">
                Thank you! Proceeds support {zone ? `${zone.org_name}'s youth program` : 'the local youth program'}.
              </p>
              <script dangerouslySetInnerHTML={{ __html: TIMER_SCRIPT }} />
            </>
          ) : session.status === 'expired' ? (
            /* ── Expired ── */
            <div class="text-center py-8">
              <div class="text-5xl mb-4">⏰</div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Session Expired</h1>
              <p class="text-gray-500 mb-6">Your parking session has ended.</p>
              <div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 mb-8 inline-block">
                <p class="font-mono font-bold text-gray-900 text-lg mb-1">{session.license_plate}</p>
                <p>{durationLabel(session.duration_hours)} · {formatCents(session.parking_amount_cents)}</p>
                {session.created_at && <p class="text-gray-400 text-xs mt-1">{fmtDateTime(session.created_at)}</p>}
              </div>
              <div>
                <a href="/park" class="inline-block bg-brand text-white font-bold py-3 px-8 rounded-2xl hover:bg-brand-dark transition-colors">
                  Park Again
                </a>
              </div>
            </div>
          ) : (
            /* ── Pending / unconfirmed ── */
            <div class="text-center py-8">
              <div class="text-5xl mb-4">⚠️</div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Payment Not Confirmed</h1>
              <p class="text-gray-500 mb-6">Please complete payment to activate your parking session.</p>
              <a href="/park" class="inline-block bg-brand text-white font-bold py-3 px-8 rounded-2xl hover:bg-brand-dark transition-colors">
                Start Over
              </a>
            </div>
          )}
        </div>
      </div>
      {isPendingAfterPayment && <script dangerouslySetInnerHTML={{ __html: pollerScript(session.id) }} />}
    </Layout>
  );
}
