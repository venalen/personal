"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    // Calculate balance from transactions using split_extra_to for fair rounding
    // Positive = Joaquin owes Vicky, Negative = Vicky owes Joaquin
    const txResult = await db_1.default.query(`
    SELECT COALESCE(SUM(
      CASE
        WHEN paid_by = 'vicky' THEN
          CASE
            WHEN split_extra_to = 'joaquin' THEN CEIL(amount_cents / 2.0)
            WHEN split_extra_to = 'vicky' THEN FLOOR(amount_cents / 2.0)
            ELSE amount_cents / 2
          END
        ELSE
          CASE
            WHEN split_extra_to = 'vicky' THEN -CEIL(amount_cents / 2.0)
            WHEN split_extra_to = 'joaquin' THEN -FLOOR(amount_cents / 2.0)
            ELSE -amount_cents / 2
          END
      END
    ), 0) AS balance_cents FROM transactions
  `);
    // Calculate balance from payments
    // When joaquin pays vicky, that reduces what joaquin owes (subtract)
    // When vicky pays joaquin, that reduces what vicky owes (add)
    const payResult = await db_1.default.query(`
    SELECT COALESCE(SUM(
      CASE
        WHEN paid_by = 'joaquin' THEN -amount_cents
        ELSE amount_cents
      END
    ), 0) AS payment_balance_cents FROM payments
  `);
    const txBalance = parseInt(txResult.rows[0].balance_cents);
    const paymentBalance = parseInt(payResult.rows[0].payment_balance_cents);
    const netBalanceCents = txBalance + paymentBalance;
    res.json({
        balanceCents: netBalanceCents,
        balance: netBalanceCents / 100,
    });
});
exports.default = router;
