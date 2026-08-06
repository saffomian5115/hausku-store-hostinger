# Requirements — hausku E-Commerce Web Application

## Project Summary
Client: NI Intellect UG (Brand: **hausku**)
Contact: Waqar Ali Anjam
Market: Germany (household & kitchen products — e.g. laptop cushions, lunch boxes, snack organizers)
Existing sales channels: Amazon, eBay
Goal: Independent web store to sell directly to customers.

> Status legend: [x] done · [~] partial (stub/placeholder) · [ ] not started — last reviewed 2026-08-06

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
- [ ] Payment gateway: PayPal — not started
- [ ] Payment gateway: Klarna — not started
- [~] Shipping rule: free above €30, flat rate below — implemented as hardcoded constants; admin-configurable pending
- [x] Order confirmation email + contact form emails (nodemailer + Hostinger SMTP) — built 2026-08-06; activate by setting SMTP_USER/SMTP_PASS in .env
- [ ] Auto-generated downloadable PDF invoice per order — not implemented
- [x] Mobile-responsive design (built responsive; QA in Phase 5)
- [ ] Return/refund request flow (14-day Widerrufsrecht compliant) — page stub only
- [ ] Customer reviews & ratings (optional/nice-to-have, not core scope) — schema exists, no UI

## Admin Panel Features
- [x] Single admin login (no multi-user roles needed)
- [x] Add/edit/delete products, incl. variants
- [x] Inventory & stock management (variant stockQty)
- [x] Order management (view, update status, process returns)
- [x] Basic sales dashboard/reports
- [x] Customer management
- [ ] Invoice & credit note generation (view/download) — not implemented
- [~] Flexible VAT configuration — DB helper exists but not wired into checkout; settings page is static UI (no save)
- [ ] Discount/coupon code management (optional/nice-to-have) — schema exists, no UI

## Legal & Regulatory Compliance (Germany/EU)
Development scope = build the pages/workflows. Client is responsible for final legal text accuracy (recommend legal/tax advisor review).
- [~] Privacy Policy page (GDPR-compliant) — page built, real text pending
- [~] Impressum page (company details, commercial register, contact — pending client details) — page built, details pending
- [~] Widerrufsrecht (14-day right of withdrawal) — page stub + returns flow pending
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
