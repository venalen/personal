export interface Transaction {
  id: number;
  description: string;
  notes: string | null;
  amount_cents: number;
  paid_by: 'user1' | 'user2';
  split_extra_to: 'user1' | 'user2' | null;
  split_user1_percent: number;
  split_mode: 'percentage' | 'offset';
  split_offset_user1_cents: number;
  split_offset_user2_cents: number;
  date: string;
  created_at: string;
  recurring_rule_id: number | null;
}

export interface RecurringRule {
  id: number;
  description: string;
  notes: string | null;
  amount_cents: number;
  paid_by: 'user1' | 'user2';
  split_user1_percent: number;
  split_mode: 'percentage' | 'offset';
  split_offset_user1_cents: number;
  split_offset_user2_cents: number;
  day_of_month: number;
  start_date: string;
  end_date: string | null;
  next_occurrence: string;
  active: boolean;
  created_at: string;
}

export interface Payment {
  id: number;
  amount_cents: number;
  paid_by: 'user1' | 'user2';
  paid_to: 'user1' | 'user2';
  date: string;
  created_at: string;
}

export interface Balance {
  balanceCents: number;
  balance: number;
}

export type User = 'user1' | 'user2';
