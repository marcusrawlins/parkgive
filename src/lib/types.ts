export type SessionStatus = 'pending' | 'active' | 'expired';

export interface Zone {
  id: string;           // e.g. "PG-001"
  name: string;         // e.g. "Pinetop Church Lot"
  address: string;
  org_name: string;
  description: string | null;
  active: number;
  created_at: string;
}

export interface Session {
  id: string;
  zone_id: string | null;
  license_plate: string;
  start_time: string | null;
  end_time: string | null;
  duration_hours: 1 | 2 | 4 | 24;
  parking_amount_cents: number;
  donation_amount_cents: number;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  status: SessionStatus;
  created_at: string;
}

export type DurationOption = {
  label: string;
  hours: 1 | 2 | 4 | 24;
  priceCents: number;
};

export type Env = {
  DB: D1Database;
  R2: R2Bucket;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  CHURCH_STRIPE_ACCOUNT_ID?: string;
  ADMIN_PASSWORD: string;
  APP_URL: string;
};
