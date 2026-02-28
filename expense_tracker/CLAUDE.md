# CLAUDE.md — Expense Tracker

## Running Locally

From the `expense_tracker/` directory:

```sh
DATABASE_URL=postgresql://localhost/expense_tracker npm run dev
```

This starts both the server (port 3000) and client (Vite, port 5173+) via `concurrently`.

**`DATABASE_URL` is required.** Without it, `pg` defaults to using the OS username as the database name, which will fail with `database "username" does not exist`.

**Port 3000 conflicts:** If the server fails with `EADDRINUSE`, a previous instance is still running. Kill it first:

```sh
kill $(lsof -ti:3000)
```

### Prerequisites
- PostgreSQL 16 must be running locally
- The `expense_tracker` database must exist: `/opt/homebrew/opt/postgresql@16/bin/createdb expense_tracker`

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
