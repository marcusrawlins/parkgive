/** @jsxImportSource hono/jsx */
import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

import type { Env } from './lib/types';
import { getTotalRaised, getSessionWithExpiry, getActiveSessions, getRecentSessions, getDashboardTotals } from './lib/db';

import { HomePage }       from './pages/home';
import { ParkPage }       from './pages/park';
import { SessionPage }    from './pages/session';
import { AdminLoginPage, AdminDashboard } from './pages/admin';

import { checkoutHandler }      from './api/checkout';
import { webhookHandler }        from './api/webhook';
import { sessionStatusHandler }  from './api/status';

const app = new Hono<{ Bindings: Env }>();

/* ── Landing page ── */
app.get('/', async (c) => {
  const totalCents = await getTotalRaised(c.env);
  return c.html(<HomePage totalCents={totalCents} />);
});

/* ── Parking form ── */
app.get('/park', (c) => {
  return c.html(<ParkPage />);
});

/* ── Session confirmation ── */
app.get('/session/:id', async (c) => {
  const id      = c.req.param('id');
  const payment = c.req.query('payment');
  const session = await getSessionWithExpiry(c.env, id);

  if (!session) {
    return c.html(
      <html><body style="font-family:sans-serif;text-align:center;padding:4rem">
        <h1>Session not found</h1>
        <p><a href="/park">Start a new session</a></p>
      </body></html>,
      404
    );
  }

  return c.html(<SessionPage session={session} payment={payment ?? undefined} />);
});

/* ── API: Stripe Checkout ── */
app.post('/api/checkout', checkoutHandler);

/* ── API: Stripe Webhook ── */
app.post('/api/webhooks/stripe', webhookHandler);

/* ── API: Session status (poller) ── */
app.get('/api/session/:id/status', sessionStatusHandler);

/* ── Admin: Login page ── */
app.get('/admin/login', (c) => {
  return c.html(<AdminLoginPage />);
});

app.post('/admin/login', async (c) => {
  const body = await c.req.parseBody();
  const password = body['password'] as string;

  if (password !== c.env.ADMIN_PASSWORD) {
    return c.html(<AdminLoginPage error="Incorrect password. Try again." />);
  }

  setCookie(c, 'admin_authed', 'true', {
    httpOnly: true,
    secure:   true,
    maxAge:   60 * 60 * 8,
    path:     '/',
    sameSite: 'Strict',
  });

  return c.redirect('/admin');
});

app.post('/admin/logout', (c) => {
  deleteCookie(c, 'admin_authed', { path: '/' });
  return c.redirect('/admin/login');
});

/* ── Admin: Dashboard (protected) ── */
app.get('/admin', async (c) => {
  const authed = getCookie(c, 'admin_authed');
  if (authed !== 'true') {
    return c.redirect('/admin/login');
  }

  const [activeSessions, recentSessions, totals] = await Promise.all([
    getActiveSessions(c.env),
    getRecentSessions(c.env),
    getDashboardTotals(c.env),
  ]);

  return c.html(
    <AdminDashboard
      activeSessions={activeSessions}
      recentSessions={recentSessions}
      totalRaisedCents={totals.totalRaisedCents}
      totalDonationCents={totals.totalDonationCents}
      totalSessions={totals.totalSessions}
    />
  );
});

export default app;
