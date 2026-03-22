-- Seed data for local development
-- Clears existing data and inserts sample transactions/payments across several months

TRUNCATE recurring_rules, transactions, payments RESTART IDENTITY;

-- January 2026
INSERT INTO transactions (description, amount_cents, paid_by, split_user1_percent, split_mode, date, notes) VALUES
  ('Groceries - Trader Joe''s',  8432, 'user1', 50, 'percentage', '2026-01-05', NULL),
  ('Electric bill',              11500, 'user2', 50, 'percentage', '2026-01-10', 'December usage'),
  ('Dinner at Pizzeria Delfina', 7820, 'user1', 50, 'percentage', '2026-01-18', NULL),
  ('Internet bill',              6999, 'user1', 50, 'percentage', '2026-01-22', 'Monthly fiber');

INSERT INTO payments (amount_cents, paid_by, paid_to, date) VALUES
  (5000, 'user2', 'user1', '2026-01-25');

-- February 2026
INSERT INTO transactions (description, amount_cents, paid_by, split_user1_percent, split_mode, date, notes) VALUES
  ('Groceries - Whole Foods',    9215, 'user2', 50, 'percentage', '2026-02-02', NULL),
  ('Gas bill',                   4800, 'user1', 50, 'percentage', '2026-02-08', NULL),
  ('Valentine''s dinner',       12500, 'user1', 50, 'percentage', '2026-02-14', 'Fancy place'),
  ('Streaming subscriptions',    3297, 'user2', 50, 'percentage', '2026-02-15', 'Netflix + Spotify'),
  ('Groceries - Costco',        15640, 'user1', 50, 'percentage', '2026-02-22', 'Big restock');

INSERT INTO payments (amount_cents, paid_by, paid_to, date) VALUES
  (10000, 'user2', 'user1', '2026-02-28');

-- March 2026
INSERT INTO transactions (description, amount_cents, paid_by, split_user1_percent, split_mode, date, notes) VALUES
  ('Groceries - Trader Joe''s',  7150, 'user2', 50, 'percentage', '2026-03-01', NULL),
  ('Electric bill',              9800, 'user1', 50, 'percentage', '2026-03-05', 'January usage'),
  ('Takeout - Thai Basil',       4250, 'user1', 50, 'percentage', '2026-03-07', NULL);

-- One with offset split mode
INSERT INTO transactions (description, amount_cents, paid_by, split_mode, split_offset_user1_cents, split_offset_user2_cents, date, notes) VALUES
  ('New vacuum cleaner', 25000, 'user1', 'offset', 15000, 10000, '2026-03-03', 'Dyson - user1 wanted the upgrade');

-- One with non-50/50 percentage
INSERT INTO transactions (description, amount_cents, paid_by, split_user1_percent, split_mode, date, notes) VALUES
  ('Gym membership',  8000, 'user2', 75, 'percentage', '2026-03-06', 'User1 goes more often');

-- Recurring rule: Rent on the 1st of each month
INSERT INTO recurring_rules (description, amount_cents, paid_by, split_user1_percent, split_mode, day_of_month, start_date, next_occurrence) VALUES
  ('Rent', 200000, 'user1', 50, 'percentage', 1, '2026-01-01', '2026-04-01');

-- March rent transaction generated from the recurring rule
INSERT INTO transactions (description, amount_cents, paid_by, split_user1_percent, split_mode, date, recurring_rule_id) VALUES
  ('Rent', 200000, 'user1', 50, 'percentage', '2026-03-01', 1);
