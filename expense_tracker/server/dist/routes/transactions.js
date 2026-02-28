"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const result = await db_1.default.query('SELECT * FROM transactions ORDER BY date DESC, created_at DESC');
    res.json(result.rows);
});
router.post('/', async (req, res) => {
    const { description, notes, amount, date, paidBy } = req.body;
    const amountCents = Math.round(amount * 100);
    let splitExtraTo = null;
    if (amountCents % 2 !== 0) {
        // Count previous odd-cent transactions to alternate
        const countResult = await db_1.default.query("SELECT split_extra_to, COUNT(*) as cnt FROM transactions WHERE split_extra_to IS NOT NULL GROUP BY split_extra_to");
        const counts = { vicky: 0, joaquin: 0 };
        for (const row of countResult.rows) {
            counts[row.split_extra_to] = parseInt(row.cnt);
        }
        // Give the extra cent to whoever has absorbed it fewer times (or vicky if tied)
        splitExtraTo = counts.vicky <= counts.joaquin ? 'vicky' : 'joaquin';
    }
    const result = await db_1.default.query(`INSERT INTO transactions (description, notes, amount_cents, paid_by, split_extra_to, date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`, [description, notes || null, amountCents, paidBy, splitExtraTo, date]);
    res.status(201).json(result.rows[0]);
});
router.delete('/:id', async (req, res) => {
    await db_1.default.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
    res.status(204).end();
});
exports.default = router;
