# Phase 5 — QA Test Results (2026-08-16)

Functional testing of cart / checkout / payments flows against a local production build (`next start`).

## Test Summary

| Area | Result |
|---|---|
| Order creation validation | ✅ Passed (missing fields, bad email, empty cart, invalid payment method, invalid variant, overstock) |
| Totals calculation | ✅ Passed (below/above free-shipping threshold, VAT math) |
| Cart logic (code review) | ✅ Passed (add/qty/remove, stock-cap, localStorage persistence) |
| Product/out-of-stock guard | ✅ Passed (button disabled when stock = 0) |
| Stripe session creation | ⚠️ **BLOCKED — placeholder API keys** (see Findings #3) |
| Webhook/verify endpoints | ✅ Passed (400 on missing signature/session_id) |
| Admin order status transitions | ✅ Fixed + verified |
| Storefront pages | ✅ All 17 routes 200 |
| Admin pages | ✅ All 8 routes 200, unauth redirects to login |
| Customer data security | 🔴 **Critical bug found + FIXED** (see Findings #1) |

## Bugs Found & Fixed

### 🔴 #1 (Critical) — Customer PII exposed via `GET /api/orders`
- **Symptom:** `GET /api/orders` returned 200 without any auth, leaking every order's customer names, emails, phones, and addresses. The admin orders list page used this endpoint, but the middleware only protects `/api/admin/*`.
- **Fix:** Added admin-session verification to the `GET` handler in `src/app/api/orders/route.ts` (POST stays public for checkout). Verified: no session → 401, valid admin session → 200, expired session → 401, POST still 201.

### 🔴 #2 (Critical) — Paid orders stuck: lowercase status broke admin transitions
- **Symptom:** Stripe payment set order status to lowercase `"paid"` (and expired sessions `"cancelled"`), but the admin status flow only knows uppercase statuses (`PENDING`…`REFUNDED`). `validTransitions["paid"]` is undefined → **admin could never change the status of a paid order** (no "Als versendet markieren", etc.).
- **Fix:** `src/lib/payments/index.ts` now transitions `PENDING → CONFIRMED` (payment received = order confirmed) and `PENDING → CANCELLED` for expired sessions. The atomic claim is now `where: { status: "PENDING" }` so a webhook can never downgrade an order the admin already moved forward. Verified: CONFIRMED → PROCESSING → SHIPPED works; shipped email sends with tracking link.

### 🟡 #3 (Blocked, needs client) — Stripe keys are placeholders
- **Symptom:** `POST /api/payments` fails with `Invalid API Key provided: sk_live_...`.
- **Cause:** `.env` contains literal placeholders: `STRIPE_SECRET_KEY="sk_live_..."`, `STRIPE_WEBHOOK_SECRET="whsec_..."`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."` — these are 11-char placeholders, not real keys.
- **Action needed:** Client must create a Stripe account (or use their existing one), grab real test/live keys, and paste them into `.env`. Until then Stripe checkout cannot be tested end-to-end. This is config, not a code issue.

### 🟢 #4 (Minor, fixed) — "Nicht verfügbar" (out of stock) shown in green
- Product page showed out-of-stock status with lime/green styling — green reads as a positive signal. Changed to red (`text-red-500`), consistent with "red = error state" brand rule.

### 🟢 #5 (Minor, fixed) — Checkout "Konto erstellen" link was red
- Brand rule keeps red only for errors/danger. Changed link to lime.

## Observations (not changed — design decisions)

- **VAT is computed on subtotal only, not shipping.** Consistent across cart, checkout, order API, and invoice PDF, so customers never see conflicting totals — but German VAT law generally taxes shipping too. Flag for client/accountant decision before launch.
- **PayPal/Klarna checkout is fake** (known, documented) — order created + stock decremented, then redirect to success with NO payment taken. Requires the PayPal/Klarna integration work; should NOT go live in this state.

## How tested
- Local production server (`npx next start`), curl against API + pages, direct Prisma checks for DB state.
- Test orders created (3,4,5,6,7) were deleted after testing; only demo order #2 (Müller Schäfer) remains.
- Emails verified via server logs (SMTP live): shipped email with tracking sent to qa-stripe@test.de.

## Remaining QA (not yet done)
- Browser-level E2E (click-through cart → checkout → payment) — blocked on Stripe keys.
- Responsiveness testing on mobile/tablet viewports.
- DE/EN language switch testing.
