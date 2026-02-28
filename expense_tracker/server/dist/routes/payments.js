"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const result = await db_1.default.query('SELECT * FROM payments ORDER BY date DESC, created_at DESC');
    res.json(result.rows);
});
router.post('/', async (req, res) => {
    const { amount, date, paidBy, paidTo } = req.body;
    const amountCents = Math.round(amount * 100);
    const result = await db_1.default.query(`INSERT INTO payments (amount_cents, paid_by, paid_to, date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [amountCents, paidBy, paidTo, date]);
    res.status(201).json(result.rows[0]);
});
router.delete('/:id', async (req, res) => {
    await db_1.default.query('DELETE FROM payments WHERE id = $1', [req.params.id]);
    res.status(204).end();
});
exports.default = router;
