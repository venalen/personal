# Splitwise App — Enhancement Checklist

## 1. Passphrase Gate
- [ ] Add passphrase screen to `App.tsx` (sessionStorage-backed)
- [ ] Add passphrase screen CSS styles

## 2. Rename App
- [ ] Change title in `client/index.html` to "Better have my money"
- [ ] Change h1 in `UserSelector.tsx`
- [ ] Change h1 in `Dashboard.tsx`

## 3. Reverse History Order
- [ ] Reverse sort in `TransactionList.tsx` (oldest first)

## 4. Human-Friendly Dates
- [ ] Add `formatDate` helper to `TransactionList.tsx`
- [ ] Replace raw date strings with formatted dates

## 5. Decorative Background
- [ ] Add Google Font (UnifrakturMaguntia) to `index.html`
- [ ] Add body::before (V) and body::after (J) CSS with watermark styling

## 6. Custom Split Percentages
- [ ] Add `split_vicky_percent` to schema, create `migrations/001_initial.sql`
- [ ] Rewrite `migrate.ts` to numbered migration runner
- [ ] Delete old `schema.sql`
- [ ] Update `transactions.ts` POST to accept `splitVickyPercent`
- [ ] Rewrite `balance.ts` with percentage-based calculation
- [ ] Add `split_vicky_percent` to client types and API
- [ ] Add split percentage inputs to `TransactionForm.tsx`
- [ ] Show non-50/50 splits in `TransactionList.tsx`
- [ ] Add split input CSS styles

## 7. Edit Functionality
- [ ] Add PUT route to `transactions.ts`
- [ ] Add PUT route to `payments.ts`
- [ ] Add `updateTransaction` and `updatePayment` to `api.ts`
- [ ] Add inline edit mode to `TransactionList.tsx`
- [ ] Add edit mode CSS styles

## 8. Verification
- [ ] Reset local DB and restart dev server
- [ ] Smoke test all features end-to-end
- [ ] Verify `tsc` builds for server and client
