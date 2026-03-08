# CLAUDE.md — Expense Tracker

## Running Locally

From the `expense_tracker/` directory:

```sh
docker compose up --build
```

This builds the app image and starts both the app (port 3000) and PostgreSQL. The database is created automatically. Access the app at `http://localhost:3000`.

To stop: `docker compose down` (add `-v` to also wipe the database volume).

### Without Docker

If you prefer running outside Docker:

```sh
DATABASE_URL=postgresql://localhost/expense_tracker npm run dev
```

This starts the server (port 3000) and client (Vite, port 5173+) via `concurrently`.

**Prerequisites:**
- PostgreSQL 16 must be running locally
- The `expense_tracker` database must exist: `/opt/homebrew/opt/postgresql@16/bin/createdb expense_tracker`
- `DATABASE_URL` is required — without it, `pg` defaults to using the OS username as the database name

**Port 3000 conflicts:** If the server fails with `EADDRINUSE`, kill the previous instance:

```sh
kill $(lsof -ti:3000)
```

## Seed Data

Populate the database with sample transactions and payments spanning multiple months. The seed script truncates existing data first, so it's safe to re-run.

**Docker:**
```sh
docker compose exec -T db psql -U postgres -d expense_tracker < server/src/seed.sql
```

**Without Docker:**
```sh
npm run seed --prefix server
```

## Test Suite

After making changes to any server or client code, run the following:

### TypeScript compilation
```sh
cd client && npx tsc --noEmit && cd ../server && npx tsc --noEmit
```

### Integration tests
```sh
npm test
```

This runs vitest against a `expense_tracker_test` database (created automatically by the pretest script). Tests cover:
- Transaction CRUD (create, read, update, delete)
- Payment CRUD
- Balance calculation (percentage mode, offset mode, payments)
- Penny distribution logic
- Server-side offset validation (rejects offsets that exceed total or produce negative shares)

### Prerequisites
- PostgreSQL 16 must be running locally
- The test DB (`expense_tracker_test`) is created automatically via the `pretest` script

### Running manually
```sh
npm test            # from expense_tracker/ root
npm test --prefix server  # from anywhere
```
