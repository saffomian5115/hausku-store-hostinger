# Requirements — hausku E-Commerce Web Application

## Project Summary
Client: NI Intellect UG (Brand: **hausku**)
Contact: Waqar Ali Anjam
Market: Germany (household & kitchen products — e.g. laptop cushions, lunch boxes, snack organizers)
Existing sales channels: Amazon, eBay
Goal: Independent web store to sell directly to customers.

> Status legend: [x] done · [~] partial (stub/placeholder) · [ ] not started — last reviewed 2026-08-16

## Languages
- German — primary/default ✅
- English — secondary (language switch option) ✅

## Product Catalog
- ~10-12 products at launch (confirm exact count before catalog build)
- Products have **variants**: size and color ✅ (schema + UI built)
- Categories: TBD — pending from client
- Product data (images, titles, descriptions, prices, variants): pending from client (seed has 8 samples)

## Customer-Facing Features
- [x] Home page with featured/best-selling products
- [x] Product catalog with categories and filters
- [x] Product detail pages (images, price, description, stock availability)
- [x] Product variant selection (size, color)
- [x] Search functionality
- [x] Shopping cart
- [x] Guest checkout (no account required)
- [x] Customer accounts (signup/login, order history, saved addresses) — alongside guest checkout
- [x] Payment gateway: **Stripe** (checkout sessions + webhook)
- [ ] Payment gateway: PayPal — credentials in `.env`, but checkout fakes it (order → success redirect, no payment taken)
- [ ] Payment gateway: Klarna — credentials in `.env`, same fake-checkout status as PayPal
- [x] Shipping rule: free above threshold, flat rate below — admin-configurable via settings (default €30 / €4.99), read from DB by cart/checkout/order API (2026-08-16)
- [x] Order confirmation email + contact form emails (nodemailer + Hostinger SMTP) — built 2026-08-06; **SMTP LIVE 2026-08-16** (SMTP_USER/SMTP_PASS in .env, test email verified)
  - [x] **Order status emails** (Shipped / Delivered / Cancelled / Refunded) — `sendOrderStatusEmail()` wired into admin order status route, sends only on actual status changes
  - [x] **Tracking in shipped emails** — `trackingNumber` + `trackingCarrier` on Order (admin order detail page input), shipped email includes tracking number + „Sendung verfolgen“ link
  - [x] **New-order admin alert** — `sendNewOrderAdminAlert()` fires on paid orders (internal notification, currently to info@hausku.com)
- [x] Auto-generated downloadable PDF invoice per order — pdf-lib, generated on paid order + admin button (2026-08-16)
- [x] Credit note (Gutschrift) PDF on refund — auto on REFUNDED status + admin button, references invoice (2026-08-16)
- [x] **Customer invoice/credit-note download in account** — order history shows PDF download links; customer download routes verify session + ownership (`/api/customers/[id]/invoices/[invoiceId]/download`, credit-notes analog) (2026-08-16)
- [x] Mobile-responsive design (built responsive; QA in Phase 5)
- [x] Smooth scrolling + smooth hover/entrance animations (Lenis + custom easing, 2026-08-15)
- [x] Wishlist / "Merkliste" (heart on product cards + wishlist page)
- [x] Google OAuth login/registration
- [x] Newsletter signup form
- [x] Return/refund request flow (14-day Widerrufsrecht) — customer requests return from order history (items + reason, one active per order), admin approves/rejects/receives/refunds in admin „Retouren“ panel, status emails, auto credit note on refund (2026-08-16)
- [~] Returns page legal text (Widerrufsbelehrung / Muster-Widerrufsformular / Rücksendeadresse) — page built, final legal text pending from client
- [ ] Customer reviews & ratings (optional/nice-to-have, not core scope) — schema exists, no UI

## Homepage / Design
- [x] Homepage redesign (2026-08): hero blob + marquee ticker, product rail, editorial sections, stats counters, testimonials, newsletter
- [x] Brand colors — lime/green theme (see AGENTS.md)
- [~] Product photos: square 1:1 needed for product cards — see `docs/AI-ASSETS.md` (current images partially landscape)

## Admin Panel Features
- [x] Single admin login (no multi-user roles needed)
- [x] Add/edit/delete products, incl. variants
- [x] Inventory & stock management (variant stockQty)
- [x] Order management (view, update status, process returns)
- [x] Basic sales dashboard/reports
- [x] Customer management
- [x] Invoice & credit note generation (view/download) — admin order detail page: create + download PDFs (2026-08-16)
- [x] Flexible VAT configuration — admin settings page saves VAT % + VAT ID to DB; cart/checkout/order API read from DB (2026-08-16)
- [ ] Discount/coupon code management (optional/nice-to-have) — schema exists, no UI

## Legal & Regulatory Compliance (Germany/EU)
Development scope = build the pages/workflows. Client is responsible for final legal text accuracy (recommend legal/tax advisor review).
- [~] Privacy Policy page (GDPR-compliant) — page built, real text pending
- [~] Impressum page (company details, commercial register, contact — pending client details) — page built, details pending
- [~] Widerrufsrecht (14-day right of withdrawal) — **flow done** (return requests + admin panel + emails), page legal text (Widerrufsbelehrung) pending from client
- [x] GPSR compliance — safety info fields built (manufacturer / responsible person, warnings) on admin form + product page
- [x] Cookie consent banner (GDPR)

## Out of Scope (for now / optional add-ons)
- Multi-admin roles/permissions
- AI-based features (not requested)
- Real-time carrier shipping rate calculation
- Loyalty programs, subscriptions

## Pending Client Inputs (do not block dev start)
- Product categories list
- Logo + brand colors/guidelines (→ will become design.md once received)
- Impressum details (address, commercial register no.)
- Full product data set (images, descriptions, prices, variants)
- Confirmed total product count
- Shipping destinations (Germany-only vs. EU-wide)
- Final legal text for Privacy Policy / Returns Policy
- ~~Domain confirmation~~ → **DONE: hausku.com** (info@hausku.com mailbox active)
