-- ParkGive D1 (SQLite) schema
-- Apply with: wrangler d1 execute parkgive --file=schema.sql --remote

-- Zones: each managed parking lot
CREATE TABLE IF NOT EXISTS zones (
  id          TEXT PRIMARY KEY,   -- e.g. "PG-001"
  name        TEXT NOT NULL,      -- e.g. "Pinetop Church Lot"
  address     TEXT NOT NULL,
  org_name    TEXT NOT NULL,      -- benefiting organization
  description TEXT,               -- optional tagline shown on zone card
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Parking sessions
CREATE TABLE IF NOT EXISTS sessions (
  id                         TEXT PRIMARY KEY,
  zone_id                    TEXT REFERENCES zones(id),
  license_plate              TEXT NOT NULL,
  start_time                 TEXT,
  end_time                   TEXT,
  duration_hours             INTEGER NOT NULL CHECK (duration_hours IN (1, 2, 4, 24)),
  parking_amount_cents       INTEGER NOT NULL,
  donation_amount_cents      INTEGER NOT NULL DEFAULT 0,
  stripe_payment_intent_id   TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  status                     TEXT NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'active', 'expired')),
  created_at                 TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS sessions_status_idx     ON sessions (status);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions (created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_zone_idx       ON sessions (zone_id);

-- Seed zone PG-001
INSERT OR IGNORE INTO zones (id, name, address, org_name, description) VALUES (
  'PG-001',
  'Pinetop Church Lot',
  '3719 Pinetop Rd, Greensboro, NC 27410',
  'The Church of Jesus Christ of Latter-day Saints',
  'Overflow parking for Pinetop Neighborhood Resort visitors'
);
