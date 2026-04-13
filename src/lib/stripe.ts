import Stripe from 'stripe';

// Will throw at runtime if STRIPE_SECRET_KEY is not set.
// Set this in .env.local before using payment features.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'not_configured');
