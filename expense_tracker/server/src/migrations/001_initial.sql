CREATE TABLE IF NOT EXISTS transactions (
  id            SERIAL PRIMARY KEY,
  description   TEXT NOT NULL,
  notes         TEXT,
  amount_cents  INTEGER NOT NULL,
  paid_by       TEXT NOT NULL CHECK (paid_by IN ('user1', 'user2')),
  split_extra_to TEXT CHECK (split_extra_to IN ('user1', 'user2')),
  split_user1_percent INTEGER NOT NULL DEFAULT 50,
  split_mode    TEXT NOT NULL DEFAULT 'percentage' CHECK (split_mode IN ('percentage', 'offset')),
  split_offset_user1_cents INTEGER NOT NULL DEFAULT 0,
  split_offset_user2_cents INTEGER NOT NULL DEFAULT 0,
  date          DATE NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id            SERIAL PRIMARY KEY,
  amount_cents  INTEGER NOT NULL,
  paid_by       TEXT NOT NULL CHECK (paid_by IN ('user1', 'user2')),
  paid_to       TEXT NOT NULL CHECK (paid_to IN ('user1', 'user2')),
  date          DATE NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW(),
  CHECK (paid_by != paid_to)
);
