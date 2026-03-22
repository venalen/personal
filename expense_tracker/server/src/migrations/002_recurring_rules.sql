CREATE TABLE IF NOT EXISTS recurring_rules (
  id                       SERIAL PRIMARY KEY,
  description              TEXT NOT NULL,
  notes                    TEXT,
  amount_cents             INTEGER NOT NULL,
  paid_by                  TEXT NOT NULL CHECK (paid_by IN ('user1', 'user2')),
  split_user1_percent      INTEGER NOT NULL DEFAULT 50,
  split_mode               TEXT NOT NULL DEFAULT 'percentage'
                           CHECK (split_mode IN ('percentage', 'offset')),
  split_offset_user1_cents INTEGER NOT NULL DEFAULT 0,
  split_offset_user2_cents INTEGER NOT NULL DEFAULT 0,
  day_of_month             INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
  start_date               DATE NOT NULL,
  end_date                 DATE,
  next_occurrence          DATE NOT NULL,
  active                   BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMP DEFAULT NOW()
);

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS recurring_rule_id INTEGER REFERENCES recurring_rules(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recurring_rules_due
  ON recurring_rules (next_occurrence)
  WHERE active = true;
