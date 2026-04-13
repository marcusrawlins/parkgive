import { Context } from 'hono';
import Stripe from 'stripe';
import type { Env } from '../lib/types';
import { getSession, activateSession } from '../lib/db';

export async function webhookHandler(c: Context<{ Bindings: Env }>) {
  const body = await c.req.text();
  const sig  = c.req.header('stripe-signature');

  if (!sig) return c.json({ error: 'Missing stripe-signature.' }, 400);

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;

  try {
    // constructEventAsync is the correct method for Cloudflare Workers
    event = await stripe.webhooks.constructEventAsync(body, sig, c.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return c.json({ error: 'Invalid signature.' }, 400);
  }

  if (event.type === 'checkout.session.completed') {
    const cs        = event.data.object as Stripe.Checkout.Session;
    const sessionId = cs.metadata?.sessionId;

    if (!sessionId) {
      console.error('Webhook: no sessionId in metadata', cs.id);
      return c.json({ received: true });
    }

    const paymentIntentId =
      typeof cs.payment_intent === 'string' ? cs.payment_intent : null;

    const existing = await getSession(c.env, sessionId);
    if (!existing) {
      console.error('Webhook: session not found:', sessionId);
      return c.json({ received: true });
    }

    const now     = new Date();
    const endTime = new Date(now.getTime() + existing.duration_hours * 60 * 60 * 1000);

    await activateSession(c.env, sessionId, {
      startTime:       now.toISOString(),
      endTime:         endTime.toISOString(),
      paymentIntentId,
    });

    console.log(`Session activated: ${sessionId} — expires ${endTime.toISOString()}`);
  }

  return c.json({ received: true });
}
