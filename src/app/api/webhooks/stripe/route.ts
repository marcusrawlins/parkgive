import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { addHours } from 'date-fns';

/**
 * Stripe sends raw (unparsed) request bodies for webhook signature verification.
 * In Next.js App Router, calling request.text() gives us the raw string — no special config needed.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  // Verify the event
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  // Handle checkout completion
  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const sessionId       = checkoutSession.metadata?.sessionId;

    if (!sessionId) {
      console.error('Webhook: no sessionId in metadata', checkoutSession.id);
      return NextResponse.json({ received: true }); // don't return 4xx — Stripe would retry
    }

    const paymentIntentId =
      typeof checkoutSession.payment_intent === 'string'
        ? checkoutSession.payment_intent
        : null;

    const supabase = createServerSupabaseClient();

    // Look up the session to get duration
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('duration_hours')
      .eq('id', sessionId)
      .single();

    if (!sessionData) {
      console.error('Webhook: session not found in DB:', sessionId);
      return NextResponse.json({ received: true });
    }

    const now     = new Date();
    const endTime = addHours(now, sessionData.duration_hours);

    const { error } = await supabase
      .from('sessions')
      .update({
        status:                   'active',
        stripe_payment_intent_id: paymentIntentId,
        start_time:               now.toISOString(),
        end_time:                 endTime.toISOString(),
      })
      .eq('id', sessionId)
      .eq('status', 'pending'); // idempotent: only update if still pending

    if (error) {
      console.error('Webhook: failed to activate session:', error);
    } else {
      console.log(`Session activated: ${sessionId} — expires ${endTime.toISOString()}`);
    }
  }

  // Always return 200 for unhandled event types
  return NextResponse.json({ received: true });
}
