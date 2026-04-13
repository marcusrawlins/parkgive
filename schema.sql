-- ParkGive D1 (SQLite) schema
-- Apply with: wrangler d1 execute parkgive --file=schema.sql --remote

CREATE TABLE IF NOT EXISTS sessions (
  id                          TEXT    PRIMARY KEY,
  license_plate               TEXT    NOT NULL,
  start_time                  TEXT,
  end_time                    TEXT,
  duration_hours              INTEGER NOT NULL CHECK (duration_hours IN (1, 2, 4, 24)),
  parking_amount_cents        INTEGER NOT NULL,
  donation_amount_cents       INTEGER NOT NULL DEFAULT 0,
  stripe_payment_intent_id    TEXT    UNIQUE,
  stripe_checkout_session_id  TEXT    UNIQUE,
  status                      TEXT    NOT NULL DEFAULT 'pending'
                                      CHECK (status IN ('pending', 'active', 'expired')),
  created_at                  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS sessions_status_idx     ON sessions (status);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions (created_at DESC);
