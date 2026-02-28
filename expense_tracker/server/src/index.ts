import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
import app from './app';
import { migrate } from './migrate';

const PORT = process.env.PORT || 3000;

async function waitForDb(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await migrate();
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Database not ready, retrying in ${delay / 1000}s... (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function start() {
  await waitForDb();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
