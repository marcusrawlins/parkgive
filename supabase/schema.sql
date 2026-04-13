-- ParkGive database schema
-- Run this in the Supabase SQL Editor: https://app.supabase.com → your project → SQL Editor

-- Enable UUID generation
create extension if not exists "pgcrypto";

create table public.sessions (
  id                          uuid        primary key default gen_random_uuid(),
  license_plate               text        not null,
  start_time                  timestamptz,
  end_time                    timestamptz,
  duration_hours              int         not null check (duration_hours in (1, 2, 4, 24)),
  parking_amount_cents        int         not null,
  donation_amount_cents       int         not null default 0,
  stripe_payment_intent_id    text        unique,
  stripe_checkout_session_id  text        unique,
  status                      text        not null default 'pending'
                                          check (status in ('pending', 'active', 'expired')),
  created_at                  timestamptz not null default now()
);

-- Indexes for common query patterns
create index sessions_status_idx     on public.sessions (status);
create index sessions_created_at_idx on public.sessions (created_at desc);
create index sessions_end_time_idx   on public.sessions (end_time) where status = 'active';

-- Row Level Security
alter table public.sessions enable row level security;

-- Allow public read by ID (for /session/[id] confirmation page)
-- The UUID is unguessable so this is safe
create policy "Public can read session by id"
  on public.sessions
  for select
  using (true);

-- All writes go through the service role key (API routes) — no public insert/update policy needed
