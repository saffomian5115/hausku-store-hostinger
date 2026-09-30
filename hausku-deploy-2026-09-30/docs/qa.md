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
| Responsiveness (390/768/1440px, 11 pages) | ✅ 11/11 clean at every viewport after fixes (see Responsiveness below) |
| DE/EN language switch | ✅ Works (cookie + reload), `html lang` now dynamic, no missing keys, no raw-key leaks |

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

### 🟡 #6 (Responsiveness, fixed) — Admin layout broke on mobile
- **Symptom:** `/admin/*` pages had a fixed 256px sidebar at every viewport; on a 390px phone the main content (e.g. admin login card) overflowed horizontally by 122px.
- **Fix:** `src/app/admin/layout.tsx` is now responsive — sidebar is `md+` only; on mobile a sticky top bar shows logo + store/logout + a horizontally scrollable nav pill row. Main content got `min-w-0 p-4 md:p-8`.

### 🟡 #7 (Responsiveness, fixed) — Storefront nav overflowed at exactly 768px
- **Symptom:** At the `md` breakpoint (768px) the desktop center nav (`hidden md:flex`) and the right icon group were both visible, overflowing the header by ~3px (18px with the scrollbar).
- **Fix:** Desktop center nav now switches at `lg` (`hidden lg:flex`) and the mobile hamburger menu shows up to `lg` (`lg:hidden`) — tablets (768–1023px) use the slide-out hamburger nav. Verified clean at 768.

### 🟢 #8 (A11y/SEO, fixed) — `html lang` was hardcoded `de`
- Root layout always rendered `<html lang="de">`, even after switching to English. Now reads the `hausku_locale` cookie (`src/app/layout.tsx`) — `lang` flips to `en` correctly.

## Responsiveness + DE/EN testing (2026-08-16)

Browser testing via headless Chrome (CDP) against the dev server. 11 pages × 3 viewports (390 mobile / 768 tablet / 1440 desktop): `/`, `/catalog`, `/product/laptopkissen-grau`, `/cart`, `/checkout`, `/contact`, `/about`, `/login`, `/register`, `/returns`, `/admin/login`.

| Viewport | Horizontal overflow | Result |
|---|---|---|
| 390px | 0 px on all 11 pages | ✅ (after admin-layout fix) |
| 768px | 0 px on all 11 pages | ✅ (after nav breakpoint fix) |
| 1440px | 0 px on all 11 pages | ✅ |

- **Decorative blobs** (AuthShell, about/login hero circles) are properly clipped by `overflow-hidden` parents — not real issues.
- **DE/EN switch:** language globe → English → cookie set + page reloads → hero/nav text in English; `html lang="en"` ✅. German back-switch works too. No missing translation keys (415/415 in de.json/en.json, all identical-value entries legit: brand names, same words, punctuation). No raw keys leak into rendered text (earlier `product.count` sighting was the dev error overlay's Prisma code frame, not a translation key).
- **`html lang` dynamic** fix included above.

## Observations (not changed — design decisions)

- **VAT is computed on subtotal only, not shipping.** Consistent across cart, checkout, order API, and invoice PDF, so customers never see conflicting totals — but German VAT law generally taxes shipping too. Flag for client/accountant decision before launch.
- **PayPal/Klarna checkout is fake** (known, documented) — order created + stock decremented, then redirect to success with NO payment taken. Requires the PayPal/Klarna integration work; should NOT go live in this state.

## How tested
- Local production server (`npx next start`), curl against API + pages, direct Prisma checks for DB state.
- Test orders created (3,4,5,6,7) were deleted after testing; only demo order #2 (Müller Schäfer) remains.
- Emails verified via server logs (SMTP live): shipped email with tracking sent to qa-stripe@test.de.

## Remaining QA (not yet done)
- Browser-level E2E (click-through cart → checkout → payment) — blocked on Stripe keys.
- Functional click-through of admin pages on mobile (screenshots) — layout fix verified programmatically, visual pass recommended.
- Accessibility pass (keyboard nav, focus states, contrast) not yet done.
