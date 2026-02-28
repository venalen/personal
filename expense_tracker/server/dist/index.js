"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const migrate_1 = require("./migrate");
const transactions_1 = __importDefault(require("./routes/transactions"));
const payments_1 = __importDefault(require("./routes/payments"));
const balance_1 = __importDefault(require("./routes/balance"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
// API routes
app.use('/api/transactions', transactions_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/balance', balance_1.default);
// Serve static client files in production
const clientDist = path_1.default.join(__dirname, '..', '..', 'client', 'dist');
app.use(express_1.default.static(clientDist));
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(clientDist, 'index.html'));
});
async function start() {
    await (0, migrate_1.migrate)();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
