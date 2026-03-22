import { Pool } from 'pg';
import { computeFinalPercent, computeSplitExtraToIfNeeded } from './splits';

/**
 * Returns the number of days in a given month (1-indexed).
 */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Computes the next occurrence date for a recurring rule.
 * Returns the first date with day = dayOfMonth (clamped to month length)
 * that is >= afterDate.
 */
export function computeNextOccurrence(dayOfMonth: number, afterDate: Date): Date {
  let year = afterDate.getFullYear();
  let month = afterDate.getMonth() + 1; // 1-indexed

  const clampedDay = Math.min(dayOfMonth, daysInMonth(year, month));
  const candidate = new Date(year, month - 1, clampedDay);

  if (candidate >= afterDate) {
    return candidate;
  }

  // Move to next month
  month++;
  if (month > 12) {
    month = 1;
    year++;
  }
  const nextClampedDay = Math.min(dayOfMonth, daysInMonth(year, month));
  return new Date(year, month - 1, nextClampedDay);
}

/**
 * Advances a date to the next month's occurrence of dayOfMonth,
 * clamped to the month's actual length.
 */
function advanceToNextMonth(current: Date, dayOfMonth: number): Date {
  let year = current.getFullYear();
  let month = current.getMonth() + 2; // next month, 1-indexed
  if (month > 12) {
    month = 1;
    year++;
  }
  const clampedDay = Math.min(dayOfMonth, daysInMonth(year, month));
  return new Date(year, month - 1, clampedDay);
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Generates any due recurring transactions.
 * Called at the start of GET /api/transactions.
 * Uses SELECT FOR UPDATE SKIP LOCKED to prevent duplicate generation
 * from concurrent requests.
 */
export async function generateDueRecurring(pool: Pool): Promise<void> {
  try {
    // Find candidate rule IDs (lightweight scan)
    const candidates = await pool.query(
      `SELECT id FROM recurring_rules
       WHERE active = true
         AND next_occurrence <= CURRENT_DATE
         AND (end_date IS NULL OR end_date >= next_occurrence)`
    );

    if (candidates.rows.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const { id } of candidates.rows) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Lock the rule row; skip if another request is already processing it
        const lockResult = await client.query(
          `SELECT * FROM recurring_rules
           WHERE id = $1
             AND active = true
             AND next_occurrence <= CURRENT_DATE
             AND (end_date IS NULL OR end_date >= next_occurrence)
           FOR UPDATE SKIP LOCKED`,
          [id]
        );

        if (lockResult.rows.length === 0) {
          await client.query('ROLLBACK');
          continue;
        }

        const rule = lockResult.rows[0];
        let nextOccurrence = new Date(rule.next_occurrence);

        // Catch-up loop: generate transactions for all due months
        while (nextOccurrence <= today) {
          const amountCents = rule.amount_cents;
          const finalPercent = computeFinalPercent(
            amountCents,
            rule.split_mode,
            rule.split_user1_percent,
            rule.split_offset_user1_cents
          );
          const splitExtraTo = await computeSplitExtraToIfNeeded(
            pool,
            amountCents,
            rule.split_mode,
            finalPercent
          );

          await client.query(
            `INSERT INTO transactions
             (description, notes, amount_cents, paid_by, split_extra_to, split_user1_percent,
              split_mode, split_offset_user1_cents, split_offset_user2_cents, date, recurring_rule_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              rule.description,
              rule.notes,
              amountCents,
              rule.paid_by,
              splitExtraTo,
              finalPercent,
              rule.split_mode,
              rule.split_offset_user1_cents,
              rule.split_offset_user2_cents,
              toDateString(nextOccurrence),
              rule.id,
            ]
          );

          // Advance to next month
          nextOccurrence = advanceToNextMonth(nextOccurrence, rule.day_of_month);

          // Check if we've passed the end date
          if (rule.end_date && nextOccurrence > new Date(rule.end_date)) {
            await client.query(
              `UPDATE recurring_rules SET next_occurrence = $1, active = false WHERE id = $2`,
              [toDateString(nextOccurrence), rule.id]
            );
            break;
          }

          // Update next_occurrence
          await client.query(
            `UPDATE recurring_rules SET next_occurrence = $1 WHERE id = $2`,
            [toDateString(nextOccurrence), rule.id]
          );

          // Check if we need to continue the catch-up loop
          if (nextOccurrence > today) break;
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Failed to generate recurring transactions for rule ${id}:`, err);
      } finally {
        client.release();
      }
    }
  } catch (err) {
    console.error('Failed to check for due recurring rules:', err);
  }
}
