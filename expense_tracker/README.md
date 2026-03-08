# Expense Tracker

A shared expense tracker for two people. Log transactions, record payments, and see who owes whom. Supports percentage-based and offset-based splits.

Built with React + Vite (client) and Express + PostgreSQL (server).

## Running locally

### With Docker (recommended)

```sh
docker compose up --build
```

This starts PostgreSQL and the app together. The database is created automatically. Access the app at `http://localhost:3000`.

To stop: `docker compose down` (add `-v` to also wipe the database volume).

### Without Docker

#### Prerequisites

- Node.js 20+
- PostgreSQL 16

#### Create the database

```sh
/opt/homebrew/opt/postgresql@16/bin/createdb expense_tracker
```

#### Install dependencies

```sh
npm install
```

#### Configure environment

Copy the example and fill in your values:

```sh
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | (required) |
| `USER1_NAME` | Display name for user1 | `User 1` |
| `USER2_NAME` | Display name for user2 | `User 2` |

#### Start the app

```sh
DATABASE_URL=postgresql://localhost/expense_tracker npm run dev
```

This starts the server on port 3000 and the client on port 5173 (or next available) via `concurrently`.

## Seed Data

Populate the database with sample transactions and payments across several months.

### With Docker

```sh
docker compose exec -T db psql -U postgres -d expense_tracker < server/src/seed.sql
```

### Without Docker

```sh
npm run seed --prefix server
```

The seed script truncates existing data first, so it's safe to re-run.

## Tests

```sh
npm test
```

Runs vitest against a `expense_tracker_test` database (created automatically by the pretest script). Covers transaction/payment CRUD, balance calculation, and split logic.

### TypeScript checks

```sh
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```
