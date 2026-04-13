import type { Env, Session, Zone } from './types';

/* ─── Zone queries ─── */

export async function getActiveZones(env: Env): Promise<Zone[]> {
  const { results } = await env.DB.prepare(
    'SELECT * FROM zones WHERE active = 1 ORDER BY created_at ASC'
  ).all<Zone>();
  return results;
}

export async function getZone(env: Env, id: string): Promise<Zone | null> {
  return env.DB.prepare('SELECT * FROM zones WHERE id = ? AND active = 1')
    .bind(id)
    .first<Zone>();
}

export async function getSession(env: Env, id: string): Promise<Session | null> {
  return env.DB.prepare('SELECT * FROM sessions WHERE id = ?')
    .bind(id)
    .first<Session>();
}

/** Fetch session and lazily mark it expired if past end_time */
export async function getSessionWithExpiry(env: Env, id: string): Promise<Session | null> {
  const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ?')
    .bind(id)
    .first<Session>();

  if (!session) return null;

  if (session.status === 'active' && session.end_time && new Date(session.end_time) < new Date()) {
    await env.DB.prepare("UPDATE sessions SET status = 'expired' WHERE id = ?")
      .bind(id)
      .run();
    return { ...session, status: 'expired' };
  }

  return session;
}

export async function createPendingSession(env: Env, data: {
  id: string;
  zoneId: string | null;
  licensePlate: string;
  durationHours: number;
  parkingCents: number;
  donationCents: number;
}): Promise<void> {
  await env.DB.prepare(`
    INSERT INTO sessions (id, zone_id, license_plate, duration_hours, parking_amount_cents, donation_amount_cents, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).bind(data.id, data.zoneId, data.licensePlate, data.durationHours, data.parkingCents, data.donationCents).run();
}

export async function updateCheckoutSessionId(env: Env, id: string, checkoutId: string): Promise<void> {
  await env.DB.prepare('UPDATE sessions SET stripe_checkout_session_id = ? WHERE id = ?')
    .bind(checkoutId, id)
    .run();
}

export async function activateSession(env: Env, id: string, data: {
  startTime: string;
  endTime: string;
  paymentIntentId: string | null;
}): Promise<void> {
  await env.DB.prepare(`
    UPDATE sessions
    SET status = 'active', start_time = ?, end_time = ?, stripe_payment_intent_id = ?
    WHERE id = ? AND status = 'pending'
  `).bind(data.startTime, data.endTime, data.paymentIntentId, id).run();
}

export async function getTotalRaised(env: Env): Promise<number> {
  const row = await env.DB.prepare(`
    SELECT COALESCE(SUM(parking_amount_cents + donation_amount_cents), 0) AS total
    FROM sessions WHERE status != 'pending'
  `).first<{ total: number }>();
  return row?.total ?? 0;
}

export async function getActiveSessions(env: Env): Promise<Session[]> {
  // Lazily expire stale sessions
  await env.DB.prepare(`
    UPDATE sessions SET status = 'expired'
    WHERE status = 'active' AND end_time < datetime('now')
  `).run();

  const { results } = await env.DB.prepare(`
    SELECT * FROM sessions WHERE status = 'active' ORDER BY end_time ASC
  `).all<Session>();
  return results;
}

export async function getRecentSessions(env: Env, limit = 50): Promise<Session[]> {
  const { results } = await env.DB.prepare(`
    SELECT * FROM sessions WHERE status != 'pending'
    ORDER BY created_at DESC LIMIT ?
  `).bind(limit).all<Session>();
  return results;
}

export async function getDashboardTotals(env: Env): Promise<{
  totalRaisedCents: number;
  totalDonationCents: number;
  totalSessions: number;
}> {
  const row = await env.DB.prepare(`
    SELECT
      COALESCE(SUM(parking_amount_cents + donation_amount_cents), 0) AS raised,
      COALESCE(SUM(donation_amount_cents), 0)                        AS donated,
      COUNT(*)                                                        AS total
    FROM sessions WHERE status != 'pending'
  `).first<{ raised: number; donated: number; total: number }>();

  return {
    totalRaisedCents:   row?.raised ?? 0,
    totalDonationCents: row?.donated ?? 0,
    totalSessions:      row?.total ?? 0,
  };
}
