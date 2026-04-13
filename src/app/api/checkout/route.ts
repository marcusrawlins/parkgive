import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calcParkingFee, calcStripeFee } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licensePlate, durationHours, donationCents } = body;

    // --- Validate ---
    if (!licensePlate || typeof licensePlate !== 'string' || !licensePlate.trim()) {
      return NextResponse.json({ error: 'License plate is required.' }, { status: 400 });
    }
    if (![1, 2, 4, 24].includes(Number(durationHours))) {
      return NextResponse.json({ error: 'Invalid duration.' }, { status: 400 });
    }

    const parkingCents    = calcParkingFee(Number(durationHours));
    const donation        = Math.max(0, Math.round(Number(donationCents) || 0));
    const subtotal        = parkingCents + donation;
    const processingCents = calcStripeFee(subtotal);

    // --- Insert pending session ---
    const supabase = createServerSupabaseClient();
    const { data: session, error: dbError } = await supabase
      .from('sessions')
      .insert({
        license_plate:          licensePlate.trim().toUpperCase(),
        duration_hours:         Number(durationHours),
        parking_amount_cents:   parkingCents,
        donation_amount_cents:  donation,
        status:                 'pending',
      })
      .select('id')
      .single();

    if (dbError || !session) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Failed to create parking session.' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const durationLabel =
      Number(durationHours) === 24
        ? 'All Day'
        : `${durationHours} Hour${Number(durationHours) > 1 ? 's' : ''}`;

    // --- Build Stripe line items ---
    const lineItems = [
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

    // --- Build Checkout session params ---
    const checkoutParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/session/${session.id}?payment=success`,
      cancel_url:  `${appUrl}/park`,
      metadata:    { sessionId: session.id },
      custom_text: {
        submit: {
          message: 'Proceeds go directly to the church youth program. Thank you! 🙏',
        },
      },
    };

    // Stripe Connect: route funds to church account if configured
    if (process.env.CHURCH_STRIPE_ACCOUNT_ID) {
      checkoutParams.payment_intent_data = {
        transfer_data: { destination: process.env.CHURCH_STRIPE_ACCOUNT_ID },
        metadata: { sessionId: session.id },
      };
    } else {
      checkoutParams.payment_intent_data = {
        metadata: { sessionId: session.id },
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

    // Persist the Stripe checkout session ID for webhook lookup
    await supabase
      .from('sessions')
      .update({ stripe_checkout_session_id: checkoutSession.id })
      .eq('id', session.id);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
