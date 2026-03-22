import { Pool } from 'pg';

/**
 * Validates that offset splits are zero-sum and don't produce negative shares.
 * Returns an error string if invalid, null if valid.
 */
export function validateOffsets(
  amountCents: number,
  splitOffsetUser1Cents: number,
  splitOffsetUser2Cents: number
): string | null {
  if (splitOffsetUser1Cents + splitOffsetUser2Cents !== 0) {
    return 'Invalid offset: offsets must sum to zero';
  }
  const half = Math.round(amountCents / 2);
  const u1Share = half + splitOffsetUser1Cents;
  const u2Share = half + splitOffsetUser2Cents;
  if (u1Share < 0 || u2Share < 0) {
    return 'Invalid offset: shares exceed total or are negative';
  }
  return null;
}

/**
 * Computes which user gets the extra penny for 50/50 splits on odd-cent amounts.
 * Alternates based on existing distribution across all transactions.
 */
export async function computeSplitExtraTo(
  pool: Pool,
  excludeId?: number
): Promise<string> {
  const query = excludeId
    ? "SELECT split_extra_to, COUNT(*) as cnt FROM transactions WHERE split_extra_to IS NOT NULL AND id != $1 GROUP BY split_extra_to"
    : "SELECT split_extra_to, COUNT(*) as cnt FROM transactions WHERE split_extra_to IS NOT NULL GROUP BY split_extra_to";
  const params = excludeId ? [excludeId] : [];
  const countResult = await pool.query(query, params);
  const counts: Record<string, number> = { user1: 0, user2: 0 };
  for (const row of countResult.rows) {
    counts[row.split_extra_to] = parseInt(row.cnt);
  }
  return counts.user1 <= counts.user2 ? 'user1' : 'user2';
}

/**
 * Converts offset mode splits to a display percentage.
 */
export function computeFinalPercent(
  amountCents: number,
  splitMode: string,
  splitUser1Percent: number,
  splitOffsetUser1Cents: number
): number {
  if (splitMode === 'offset') {
    const user1Share = Math.round(amountCents / 2) + splitOffsetUser1Cents;
    return Math.round((user1Share / amountCents) * 100);
  }
  return splitUser1Percent;
}

/**
 * Determines split_extra_to for a transaction if applicable.
 * Returns null if penny distribution is not needed.
 */
export async function computeSplitExtraToIfNeeded(
  pool: Pool,
  amountCents: number,
  splitMode: string,
  finalPercent: number,
  excludeId?: number
): Promise<string | null> {
  if (splitMode === 'percentage' && finalPercent === 50 && amountCents % 2 !== 0) {
    return computeSplitExtraTo(pool, excludeId);
  }
  return null;
}
