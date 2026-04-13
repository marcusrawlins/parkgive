import { Context } from 'hono';
import Stripe from 'stripe';
import type { Env } from '../lib/types';
import { calcParkingFee, calcStripeFee } from '../lib/pricing';
import { createPendingSession, updateCheckoutSessionId } from '../lib/db';

export async function checkoutHandler(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json<{
      licensePlate: string;
      durationHours: number;
      donationCents: number;
      zoneId?: string;
    }>();

    const { licensePlate, durationHours, donationCents, zoneId } = body;

    if (!licensePlate?.trim()) {
      return c.json({ error: 'License plate is required.' }, 400);
    }
    if (![1, 2, 4, 24].includes(Number(durationHours))) {
      return c.json({ error: 'Invalid duration.' }, 400);
    }

    const parkingCents    = calcParkingFee(Number(durationHours));
    const donation        = Math.max(0, Math.round(Number(donationCents) || 0));
    const processingCents = calcStripeFee(parkingCents + donation);
    const durationLabel   = Number(durationHours) === 24 ? 'All Day' : `${durationHours} Hour${Number(durationHours) > 1 ? 's' : ''}`;

    // Create pending session in D1
    const sessionId = crypto.randomUUID();
    await createPendingSession(c.env, {
      id:            sessionId,
      zoneId:        zoneId ?? null,
      licensePlate:  licensePlate.trim().toUpperCase(),
      durationHours: Number(durationHours),
      parkingCents,
      donationCents: donation,
    });

    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
    const appUrl = c.env.APP_URL || 'https://parkgive.com';

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Parking — ${durationLabel}`,
            description: 'Proceeds support the local youth program',
          },
          unit_amount: parkingCents,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Credit Card Processing Fee' },
          unit_amount: processingCents,
        },
        quantity: 1,
      },
    ];

    if (donation > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Extra Donation — Youth Program',
            description: 'Thank you for your generosity!',
          },
          unit_amount: donation,
        },
        quantity: 1,
      });
    }

    const paymentIntentData: Stripe.Checkout.SessionCreateParams.PaymentIntentData = {
      metadata: { sessionId },
    };
    if (c.env.CHURCH_STRIPE_ACCOUNT_ID) {
      paymentIntentData.transfer_data = { destination: c.env.CHURCH_STRIPE_ACCOUNT_ID };
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/session/${sessionId}?payment=success`,
      cancel_url:  `${appUrl}/park`,
      metadata:    { sessionId },
      payment_intent_data: paymentIntentData,
      custom_text: {
        submit: { message: 'Proceeds go directly to the church youth program. Thank you! 🙏' },
      },
    });

    await updateCheckoutSessionId(c.env, sessionId, session.id);

    return c.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return c.json({ error: 'Internal server error.' }, 500);
  }
}
