# Project Memory / Status Log — hausku E-Commerce Web Application

Purpose: running log of client info, key decisions, and current status — read this first when resuming work on this project (especially useful for AI coding assistant context continuity across sessions).

## Client Info
- Business: NI Intellect UG
- Brand: hausku
- Contact: Waqar Ali Anjam
- Market: Germany, general household/kitchen products (e.g. laptop cushions, lunch boxes, snack organizers)
- Sells on Amazon/eBay already; this is their first independent web store
- Reference site shown by client: blockhuette.net (note: that site is built on Shopify — client's expectations of polish may be shaped by this; our custom build should account for that)

## Key Decisions Made
- Tech stack: Next.js + MySQL, hosted entirely on client's existing Hostinger Business plan (Node.js supported — confirmed).
- Payment gateways: Stripe + PayPal + Klarna (all three).
- VAT: must be admin-configurable, not hardcoded (client currently at 19% but wants flexibility).
- Checkout: guest checkout + optional account creation, both supported.
- Shipping: free above €30, flat rate below.
- Legal scope: Privacy Policy (GDPR), Impressum, Widerrufsrecht, GPSR — dev builds pages/workflow, client owns final legal text accuracy.
- Source code handover: included unconditionally in the agreement.
- Admin: single user only, no roles/permissions system needed.
- Invoices & credit notes: auto-generated, downloadable PDFs.

## Pricing Agreement
- No fixed price — final amount mutually agreed after completion based on quality/quantity of work delivered.
- Minimum guaranteed amount: €100.
- 40% of minimum (€40) requested upfront to officially start work.
- Monthly maintenance after free 30-day support: €35-50/month (optional, client's choice).

## Status (updated 2026-08-06)

### Development progress
- [x] Proposal drafted, revised, and accepted by client
- [x] Kickoff message sent requesting 40% upfront (€40) — upfront payment status TBC
- [x] **Phase 1 — Planning & Design: COMPLETE** (Next.js skeleton, Prisma schema, DE/EN locales, storefront + admin shells, shared components, API structure, build verified)
- [x] **Phase 2 — Core Development: COMPLETE** (catalog + categories with filter/sort, product detail with size/color variants, homepage featured products, seed script, cart with free-shipping progress, search with Cmd+K, guest checkout with stock check, customer accounts with order history + addresses, admin panel: product CRUD + variants + image upload, order management, customers, dashboard, admin auth)
- [~] **Phase 3 — Payment & Integrations: PARTIAL**
  - [x] Stripe integration (checkout sessions, webhook, idempotent order processing)
  - [x] **Email integration (2026-08-06):** nodemailer + Hostinger SMTP (`src/lib/email`). Order confirmation emails sent after successful Stripe payment (webhook + success-page fallback, idempotent); contact form now actually sends to info@hausku.com (`/api/contact`). Needs SMTP_USER/SMTP_PASS in .env to go live.
  - [ ] PayPal integration — not started
  - [ ] Klarna integration — not started
  - [~] VAT: DB-driven helper (`src/lib/vat`) exists, but cart/checkout/order API still hardcode 19%. Admin settings page is static UI (no save). **Wiring pending.**
  - [~] Shipping rule (free > €30 / flat €4.99): implemented as hardcoded constants in order API. Configurable via settings pending.
- [~] **Phase 4 — Legal & Compliance: PARTIAL**
  - [~] Privacy / Imprint / Terms / Returns pages exist as stubs — real legal text + client details pending
  - [x] GPSR fields built (manufacturer + safetyWarnings in schema, admin product form, product page display)
  - [x] Cookie consent banner built
  - [ ] Invoice + credit note PDF generation — NOT implemented (TODO stubs in `src/lib/invoices` + `/api/invoices`)
  - [ ] Widerruf / returns flow — page stub only
- [ ] **Phase 5 — Testing & QA: not started** (functional, responsiveness, DE/EN switch, bug fixing)
- [ ] **Phase 6 — Deployment & Handover: not started** (deploy package ready — see `DEPLOY-README.md`)

### Email / Hostinger
- Hostinger Business hosting + business email active.
- 5 mailboxes available; 1 created so far: **info@hausku.com** (credentials in hand).
- ✅ **Domain confirmed: hausku.com** — all `hausku.de` references updated to `hausku.com` (seed, locales, contact, imprint, admin default, DEPLOY-README).
- ✅ **Email integration DONE (2026-08-06):** nodemailer + Hostinger SMTP (`src/lib/email`) — order confirmation emails after payment + live contact form. To activate, add SMTP_USER/SMTP_PASS (mailbox credentials) to `.env`.

## Recommended Next Steps
1. **Fill SMTP credentials** — put info@hausku.com mailbox password into `SMTP_USER`/`SMTP_PASS` in `.env`, then test contact form + a real order
2. **Finish Phase 3** — wire VAT + shipping settings from DB into checkout/orders, make admin settings page functional, PayPal, Klarna
3. **Finish Phase 4** — legal text content, invoice PDF generation, returns flow
4. **Phase 5 testing → Phase 6 deploy** to Hostinger (steps in DEPLOY-README.md)

## Open Questions / To Revisit Later
- design.md to be created once logo/brand colors are received from client
- Confirm exact upfront payment method (PayPal suggested to avoid wire transfer fees eating into the €40)
- Confirm final product count (10-12 discussed, not yet locked)
- Confirm shipping destinations: Germany-only, or wider EU
- ~~Confirm real domain~~ → **DONE: hausku.com**
- Distribute remaining 4 mailboxes (e.g. admin@, sales@, support@) — optional
