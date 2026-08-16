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

## Status (updated 2026-08-16)

### Development progress
- [x] Proposal drafted, revised, and accepted by client
- [x] Kickoff message sent requesting 40% upfront (€40) — upfront payment status TBC
- [x] **Phase 1 — Planning & Design: COMPLETE** (Next.js skeleton, Prisma schema, DE/EN locales, storefront + admin shells, shared components, API structure, build verified)
- [x] **Phase 2 — Core Development: COMPLETE** (catalog + categories with filter/sort, product detail with size/color variants, homepage featured products, seed script, cart with free-shipping progress, search with Cmd+K, guest checkout with stock check, customer accounts with order history + addresses, admin panel: product CRUD + variants + image upload, order management, customers, dashboard, admin auth)
- [~] **Phase 3 — Payment & Integrations: PARTIAL**
  - [x] Stripe integration (checkout sessions, webhook, idempotent order processing)
  - [x] **Email integration (2026-08-06 → LIVE 2026-08-16):** nodemailer + Hostinger SMTP (`src/lib/email`). Order confirmation emails sent after successful Stripe payment (webhook + success-page fallback, idempotent); contact form sends to info@hausku.com (`/api/contact`). **SMTP credentials now in `.env` (2026-08-16) — test email verified working.**
  - [x] **Order status emails (2026-08-16):** `sendOrderStatusEmail()` — Shipped 📦 / Delivered ✅ / Cancelled ❌ / Refunded 💶 — wired into admin order status route `PUT /api/admin/orders/[id]`, sends only on actual status changes. Reply-to info@hausku.com.
  - [x] **Tracking info (2026-08-16):** Order schema + admin order detail page now have `trackingNumber` + `trackingCarrier` (DHL/Hermes/DPD/GLS/Deutsche Post). Shipped emails include the tracking number + a „Sendung verfolgen“ button (URL built via `getTrackingUrl` in `src/lib/email`). Same-status PUTs allowed for saving tracking without changing status.
  - [x] **New-order admin alert (2026-08-16):** `sendNewOrderAdminAlert()` fires on **paid** orders (in `processPaidOrder`) — internal notification with order number, customer, item count, amount. Currently to `info@hausku.com` (`SMTP_ADMIN_ALERT_TO`).
  - [ ] PayPal integration — not started
  - [ ] Klarna integration — not started
  - [x] **VAT + shipping configurable (2026-08-16):** `src/lib/settings` (get/save over Setting table) is the single source of truth. Admin settings page now loads + saves (VAT %, VAT ID, free-shipping threshold, flat rate, shop info). Cart, checkout, and order API all read VAT/shipping from DB — no hardcoded 19%/€30/€4.99 anymore. Public `/api/settings` + admin `/api/admin/settings` (proxy-protected). Tested: save → reflected in public API → restored.
- [~] **Phase 4 — Legal & Compliance: PARTIAL**
  - [~] Privacy / Imprint / Terms pages exist as stubs — real legal text + client details pending
  - [x] Returns/Widerrufsrecht page built + **return request flow functional** (2026-08-16); page legal text (Widerrufsbelehrung / Musterformular / Rücksendeadresse) still placeholder — client final text pending
  - [x] GPSR fields built (manufacturer + safetyWarnings in schema, admin product form, product page display)
  - [x] Cookie consent banner built
  - [x] **Invoice + credit note PDFs (2026-08-16):** `src/lib/invoices` implemented with **pdf-lib** (pure JS, no native deps). German invoice layout (HAUSKU header, company info from settings, customer address, item table, VAT breakdown, legal footer); credit notes reference the invoice + reason. Numbers `RE-YYYY-XXXX` / `GN-YYYY-XXXX` (unique-safe retry). Saved to `public/invoices/` (gitignored). Auto-generated: invoice on paid order (best-effort in `processPaidOrder`), credit note when admin sets REFUNDED. Admin order detail page has „Rechnung erstellen“ / „Gutschrift erstellen“ + PDF download buttons. Endpoints: `POST /api/admin/invoices`, `GET /api/admin/invoices/[id]/download`, `GET /api/admin/credit-notes/[id]/download`. WinAnsi sanitizer guards against non-encodable chars. Live-tested: RE-2026-0001 + GN-2026-0001 generated, downloaded, text-verified (umlauts ✓).
  - [x] **Customer invoice download in account (2026-08-16):** order history (`/account/orders`) shows „Rechnung (PDF)“ / „Gutschrift (PDF)“ download links per order. New customer routes `GET /api/customers/[id]/invoices/[invoiceId]/download` + `GET /api/customers/[id]/credit-notes/[creditNoteId]/download` — both verify the storefront `session` cookie AND that the PDF belongs to an order of that customer (401/404 otherwise). `GET /api/customers/[id]/orders` now includes invoice + creditNote info and also requires session ownership. Helper: `src/lib/customerSession.ts`. Live-tested: 200 PDFs authorized, 401 no session / wrong customer, 404 foreign invoice.
  - [x] **Returns / Widerruf flow (2026-08-16):** `ReturnRequest` model (`RET-YYYY-XXXX`, status flow PENDING → APPROVED|REJECTED → RECEIVED → REFUNDED). Customer: „Retoure anfordern“ button on DELIVERED orders in `/account/orders` — select items + reason, one active request per order enforced. Admin: new `/admin/returns` list + detail pages (nav link „Retouren“), status transitions + internal note (gemailt to customer), auto credit note on REFUNDED. Emails: `sendReturnStatusEmail()` on every status change. Live-tested: create → duplicate blocked → approve → received → refunded → auto credit note GN-2026-0002, all 4 emails sent. `src/lib/returns`, `POST/GET /api/customers/[id]/returns`, `GET /api/admin/returns`, `GET/PUT /api/admin/returns/[id]`.
- [~] **Phase 5 — Testing & QA: STARTED (2026-08-16)** — functional testing of cart/checkout/payments done, **2 critical bugs fixed** (public order-list PII leak; paid-order status stuck on lowercase `paid`). Full results + remaining items: `docs/qa.md`. Browser E2E blocked on real Stripe keys (placeholders in `.env`). Responsiveness + DE/EN switch testing pending.
- [ ] **Phase 6 — Deployment & Handover: not started** (deploy package ready — see `DEPLOY-README.md`)

### Email / Hostinger
- Hostinger Business hosting + business email active.
- 5 mailboxes available; 1 created so far: **info@hausku.com**.
- ✅ **Domain confirmed: hausku.com** — all `hausku.de` references updated to `hausku.com` (seed, locales, contact, imprint, admin default, DEPLOY-README).
- ✅ **SMTP LIVE (2026-08-16):** `SMTP_USER`/`SMTP_PASS` (info@hausku.com mailbox) added to `.env` — test email verified. All automated emails send from info@hausku.com (order confirmation, contact form, order status, new-order admin alert). `SMTP_ADMIN_ALERT_TO="info@hausku.com"` (admin mailbox not created yet).

## Recent Work (2026-08-15 → 2026-08-16)
- ✅ **Emails LIVE + tracking (2026-08-16):** SMTP credentials in `.env` (test verified); order status emails (Shipped/Delivered/Cancelled/Refunded); new-order admin alert (→ info@ for now); tracking number + carrier field in admin order detail, tracking link in shipped emails.
- ✅ **Admin settings functional (2026-08-16):** VAT + shipping (and shop info) now saved to DB from the admin settings page; cart/checkout/order API read from DB.
- ✅ **Invoice + credit note PDFs (2026-08-16):** pdf-lib generator in `src/lib/invoices`, admin generate/download UI, auto-trigger on paid order + REFUNDED status. Test order #2 (Müller Schäfer) in DB has sample invoice `RE-2026-0001` + credit note `GN-2026-0001` — test data, can be deleted.
- ✅ **Customer invoice downloads (2026-08-16):** `/account/orders` now shows per-order „Rechnung (PDF)“ + „Gutschrift (PDF)“ links; customer download routes with session + ownership checks; orders API secured (session required). Test customer `demo@hausku.com` / `Demo1234!` created and attached to test order #2 for browser verification — test data, can be deleted.
- ✅ **Returns/Widerruf flow (2026-08-16):** full return-request process — customer requests from order history (items + reason), admin approves/rejects/tracks/refunds in new Retouren panel, status emails, auto credit note on refund. Test data: return `RET-2026-0001` on order #2 is REFUNDED with credit note `GN-2026-0002` (reason „Retoure RET-2026-0001“) — can be deleted.
- ✅ **Homepage redesign** — new HeroBlob, Marquee, ProductRail, StatCounter components + editorial sections (commits `23532e6`, `62d8a8f`)
- ✅ **UX polish — smooth scroll + animations:** Lenis smooth-scroll library added (`src/components/shared/SmoothScroll.tsx`, wrapped in storefront layout); new easing tokens `ease-out-quart` / `ease-out-expo` in `globals.css`; ProductCard + homepage bento/testimonial cards got smooth hover transitions. Wheel/trackpad scroll is now buttery; reduced-motion users automatically get native scroll.
- ✅ **Google OAuth login/register** (`/api/auth/google`) — commit `4315f4b`
- ✅ **Wishlist** (heart/like) — API + context + storefront icons
- ✅ **Newsletter form** — component + API
- ✅ **English translations** (en.json) + language switcher

## Recommended Next Steps (priority order)
1. **Get real Stripe keys from client** — `.env` has placeholders (`sk_live_...`, `whsec_...`, `pk_live_...`). Without real keys, Stripe checkout can't be tested end-to-end (QA finding #3).
2. **Wire PayPal + Klarna** — credentials (`PAYPAL_CLIENT_ID/SECRET`, `KLARNA_USERNAME/PASSWORD`) are ALREADY in `.env`, but checkout still fakes both methods: order is created then redirected straight to `/checkout/success` with NO payment taken. This is the biggest correctness gap. `src/lib/payments/index.ts` has TODO placeholders.
3. **Finish Phase 4 legal text** — privacy/impressum/terms/returns page content (client final text pending) + fill Rücksendeadresse into returns page.
4. **Continue Phase 5** — browser E2E (needs Stripe keys), responsiveness, DE/EN switch. Results so far: `docs/qa.md`.
5. **Phase 6 deploy** to Hostinger (steps in DEPLOY-README.md) — NOT before PayPal/Klarna fake-checkout is fixed.
6. Optional: create remaining mailboxes (admin@, sales@, support@) — `SMTP_ADMIN_ALERT_TO` can then point admin alerts to admin@hausku.com.

## Open Questions / To Revisit Later
- design.md to be created once logo/brand colors are received from client
- Confirm exact upfront payment method (PayPal suggested to avoid wire transfer fees eating into the €40)
- Confirm final product count (10-12 discussed, not yet locked)
- Confirm shipping destinations: Germany-only, or wider EU
- ~~Confirm real domain~~ → **DONE: hausku.com**
- Distribute remaining 4 mailboxes (e.g. admin@, sales@, support@) — optional
