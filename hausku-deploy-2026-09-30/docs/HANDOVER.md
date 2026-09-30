# Project Handover — HAUSKU Webshop (NI Intellect UG)

> Audience: NI Intellect UG (client) and future developers taking over the
> project. Last updated: 2026-09-19. This document is part of Correction #31
> (Source Code Handover) in `docs/CORRECTION-TODO.md`.

## 1. What this project is

Next.js (App Router) webshop for HAUSKU (brand of NI Intellect UG), with
admin panel, Stripe Checkout, invoice/credit-note PDFs, returns (RMA), customer
accounts and bilingual (DE/EN) storefront.

## 2. Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 LTS |
| npm | ≥ 10 |
| SQLite | bundled via Prisma (file DB — no server needed) |

## 3. Setup (local)

```bash
npm install
npx prisma generate          # Prisma client
npx prisma db push           # create/sync the SQLite database (prisma/dev.db)
npx prisma db seed           # demo products, categories, settings, reviews
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## 4. Environment variables (`.env`)

All secrets live here — NEVER commit `.env`. Production assets (hosting env,
CI/CD secrets, database backups) must be owned by NI Intellect UG.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | SQLite file path (Prisma), e.g. `file:./dev.db` |
| `AUTH_SECRET` | ✅ (prod) | HMAC key for admin + customer session cookies. **Must be set in production** — without it a dev fallback is used and a warning is logged. Generate: `openssl rand -base64 32` |
| `ADMIN_EMAIL` | ✅ (prod) | Admin panel login. Default `admin@hausku.com` (dev only) |
| `ADMIN_PASSWORD` | ✅ (prod) | Admin panel password. Default `hausku-admin-2024` (dev only) — **rotate before launch** |
| `NEXT_PUBLIC_APP_URL` | ✅ (prod) | Public base URL, e.g. `https://hausku.com` (used in emails, sitemap, robots, Stripe redirects) |
| `STRIPE_SECRET_KEY` | ✅ (prod) | Stripe API key. Placeholder keys = checkout will fail. Request test keys from client first |
| `STRIPE_WEBHOOK_SECRET` | ✅ (prod) | Stripe webhook signature verification (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | optional | Only if client-side Stripe.js is added later |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | optional | Transactional emails (order confirmation, returns, contact). Emails are skipped silently when unset |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | "Sign in with Google" |
| `ADMIN_TOTP_SECRET` (Fallback) | optional | Statischer 2FA-Fallback-Code, **nur falls DB unzugänglich** — siehe Abschnitt 5 |

## 5. Admin panel

- URL: `/admin` (login with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Sessions are HMAC-signed cookies (`admin-session`, 24 h TTL)
- All `/api/admin/*` routes require a valid session (`requireAdmin` guard)
- **2FA (TOTP)**: einmalig unter Einstellungen → „Zwei-Faktor-Authentifizierung"
  einrichten (Secret in Authenticator-App eintragen, mit Live-Code bestätigen).
  Danach verlangt der Login zusätzlich den 6-stelligen Code. Secret liegt in
  eigenen `settings`-Rows (`admin_2fa_*`), nie in den öffentlichen Store-Settings.
  Notfall-Zugang ohne DB: `ADMIN_TOTP_SECRET` als Fallback setzen (gleiche
  Base32-Semantik wie die App). Verlorenes Gerät: Secret-Row
  `admin_2fa_secret` + `admin_2fa_enabled` per DB-Zugriff löschen.
- Manage: products (incl. GPSR fields), categories, orders, returns, invoices,
  credit notes, reviews, store settings (company data — single source of truth
  for invoices and email footers)

## 6. Database

- SQLite via Prisma; schema in `prisma/schema.prisma`
- No migration folders — schema changes go through `npx prisma db push`
  (for production, switch to `prisma migrate deploy` if a real DB server is used)
- Seed: `npx prisma db seed` (`prisma/seed.ts`) — demo data, do NOT run on prod DB

**Backups:** copy `prisma/dev.db` (or dump the production DB) regularly.
Restore = replace the file and restart. Document the schedule (see open item in
CORRECTION-TODO #30).

## 7. Payments

- Stripe Checkout only (PayPal/Klarna intentionally disabled until real
  integration — see CORRECTION-TODO #16)
- Flow: order created PENDING → Stripe session → webhook
  `/api/webhooks/stripe` + success-page verify (both idempotent, atomic
  PENDING→CONFIRMED claim) → stock decrement + emails + auto-invoice
- Webhook endpoint must be configured in the Stripe dashboard

## 8. Security summary (what is implemented)

- HMAC-signed session cookies (admin + customer), `httpOnly`, `sameSite=lax`,
  `secure` in production
- `requireAdmin` guard on every `/api/admin/*` route
- Server-side validation + in-memory rate limiting (login, contact)
- Stripe webhook signature verification
- Generic auth error messages (no user enumeration)
- Passwords: customers are bcrypt-hashed in `src/app/api/auth/register` /
  `login` (see source); admin credentials come from env

Still open before production (CORRECTION-TODO #30/#22): CSRF review for
cookie-based mutations, shared rate-limit store (Redis) for multi-instance
deploys, cookie consent banner, DB backup automation, 2FA for admin,
error/uptime monitoring.

## 9. Handover checklist (Correction #31)

- [x] Complete application source code (this repository)
- [x] Database schema (`prisma/schema.prisma`) + seed script
- [x] Deployment configuration (env vars above; Vercel/Node hosting ready)
- [x] Environment variable documentation (this file)
- [x] Setup/deployment instructions (this file)
- [x] Dependency list (`package.json`)
- [x] Backup/restore instructions (section 6)
- [ ] **Git repository ownership transfer to NI Intellect UG** ← client side
- [ ] **Production asset ownership transfer** (domain, hosting, Stripe account,
      email account, DNS) ← client side
- [ ] Rotate `ADMIN_PASSWORD` + set `AUTH_SECRET` in production env ← client side

## 10. Where to find things

| Area | Path |
|---|---|
| Storefront pages | `src/app/(storefront)/` |
| Checkout | `src/app/(checkout)/` |
| Admin pages | `src/app/admin/` |
| Admin API | `src/app/api/admin/` |
| Storefront API | `src/app/api/` (orders, auth, contact, categories…) |
| Email templates | `src/lib/email/index.ts` |
| Invoice/credit-note PDFs | `src/lib/invoices/index.ts` |
| Company settings (single source of truth) | `src/lib/settings/index.ts` |
| Legal pages content | `src/locales/*.json` + `legal pages/` (client texts) |
| Docs | `docs/` (CORRECTION-TODO, CLIENT-DATA-NEEDED, memory, qa) |
