import express from 'express';
import path from 'path';
import transactionsRouter from './routes/transactions';
import paymentsRouter from './routes/payments';
import balanceRouter from './routes/balance';
import configRouter from './routes/config';

const app = express();

app.use(express.json());

// API routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/config', configRouter);

// Serve static client files in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

export default app;
