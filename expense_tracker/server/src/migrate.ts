import fs from 'fs';
import path from 'path';
import pool from './db';

export async function migrate(): Promise<void> {
  // Create migrations tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY
    )
  `);

  // Find migrations directory (works in both dev and compiled modes)
  let migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    migrationsDir = path.join(__dirname, '..', 'src', 'migrations');
  }

  // Read and sort migration files
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  // Get already-applied versions
  const applied = await pool.query('SELECT version FROM schema_migrations');
  const appliedVersions = new Set(applied.rows.map((r: { version: number }) => r.version));

  for (const file of files) {
    const version = parseInt(file.split('_')[0], 10);
    if (appliedVersions.has(version)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
    console.log(`Applied migration: ${file}`);
  }

  console.log('Database migration complete');
}
