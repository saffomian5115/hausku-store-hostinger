# Development Phases — hausku E-Commerce Web Application

Estimated total duration: ~5-6 weeks. — Status last reviewed: 2026-08-16

## Phase 1 — Planning & Design ✅ COMPLETE
- [x] Set up Next.js project skeleton + folder structure per architecture.md
- [x] Prisma schema with all database tables (MySQL)
- [x] Locale files (German default + English)
- [x] Storefront page shells (home, catalog, product, cart, checkout, account)
- [x] Admin panel shell (dashboard, products, orders, customers, settings)
- [x] Shared components (StorefrontNav, StorefrontFooter, CookieConsent, LanguageSwitcher, MobileNav)
- [x] API route structure (products, orders, auth, payments, invoices)
- [x] VAT calculation helper (reads from DB, not hardcoded)
- [x] Payment & invoice placeholders
- [x] Legal page stubs (privacy, imprint, terms, returns)
- [x] Environment config (.env, .env.example)
- [x] Build verified — 25+ routes, no errors
- [ ] Pending from client: product data, logo/brand colors, Impressum details

## Phase 2 — Core Development ✅ COMPLETE
- [x] Product catalog + category pages (Prisma-powered with filtering, sorting, categories)
- [x] Product detail pages with size/color variant selection (Prisma-powered)
- [x] Homepage with featured products from Prisma
- [x] Database seed script with 8 sample products, 3 categories, settings
- [x] Reusable ProductCard component
- [x] Shopping cart (add to cart, quantity management, localStorage persistence, free shipping progress)
- [x] Search functionality (SearchBar component with Cmd+K shortcut, catalog filtering, filter chips)
- [x] Guest checkout flow (form validation, order creation API with stock check, success page)
- [x] Customer account system (signup/login with bcryptjs, session cookies, order history, address CRUD, **invoice/credit-note PDF download** — 2026-08-16)
- [x] Admin panel: product CRUD (create/edit/delete, variant management, image upload, in-place variant updates)
- [x] Admin panel: orders management (status updates, order detail view)
- [x] Admin panel: customers management, dashboard stats
- [x] Admin authentication middleware (protected routes, login page, session cookies)

## Phase 3 — Payment & Integrations (in progress)
- [x] Stripe integration (checkout sessions, webhook handler, idempotent order processing, lazy SDK init)
- [ ] PayPal integration — credentials in `.env`, but checkout fakes it (order → success redirect, no payment taken). TODO in `src/lib/payments/index.ts`
- [ ] Klarna integration — credentials in `.env`, same fake-checkout status as PayPal
- [x] Flexible VAT settings — admin settings page saves VAT % + VAT ID to DB (`src/lib/settings`), cart/checkout/order API read from DB (2026-08-16)
- [x] Shipping rule (free above threshold / flat rate) — admin-configurable via settings (default €30 / €4.99), used by cart/checkout/order API (2026-08-16)

## UX Polish (2026-08-15) ✅
- [x] Smooth scrolling via Lenis (`src/components/shared/SmoothScroll.tsx`, storefront layout)
- [x] Custom easing tokens (`ease-out-quart` / `ease-out-expo`) + smooth hover transitions on product/bento/testimonial cards
- [x] Scroll-triggered section animations use smoother curve + will-change
- [x] Homepage redesign (hero blob, marquee, editorial sections) — commits `23532e6`, `62d8a8f`

## Phase 4 — Legal & Compliance (in progress)
- [x] GPSR-related product fields (manufacturer + safetyWarnings: schema, admin form, product page)
- [x] Cookie consent banner (GDPR)
- [~] Privacy Policy page (GDPR) — page built, real legal text pending from client
- [~] Impressum page — page built, company details pending from client
- [x] Widerruf / returns flow — `ReturnRequest` model + customer return form in order history (items + reason, one active per order) + admin „Retouren“ panel (approve/reject/receive/refund) + status emails + auto credit note on refund (2026-08-16)
- [~] Returns page legal text (Widerrufsbelehrung / Muster-Widerrufsformular / Rücksendeadresse) — page built, final legal text pending from client
- [x] Invoice + credit note PDF generation — pdf-lib (`src/lib/invoices`), admin create/download UI, auto on paid order + REFUNDED (2026-08-16)
- [x] Customer invoice/credit-note download in account — order history shows PDF links; customer download routes verify session + ownership; orders API secured (2026-08-16)

## Phase 5 — Testing & QA (in progress — started 2026-08-16)
- [x] Functional testing (cart, checkout, payments) — see `docs/qa.md`; **2 critical bugs fixed** (public `/api/orders` PII leak → admin-session required; paid orders stuck on lowercase `paid` status → now `CONFIRMED`)
- [ ] Payments end-to-end (Stripe sandbox) — ⚠️ **BLOCKED: `.env` has placeholder Stripe keys (`sk_live_...`), real keys needed from client**
- [ ] PayPal/Klarna checkout — still fake (order → success redirect, no payment); verify/fix before any real order
- [ ] Responsiveness testing (mobile/tablet/desktop)
- [ ] German/English language switch testing
- [ ] Bug fixing (ongoing) — minor fixes done: out-of-stock color, checkout link color

## Phase 6 — Deployment & Handover (not started)
- [ ] Deploy to client's Hostinger Business account (steps in DEPLOY-README.md)
- [ ] SSL setup
- [ ] Admin panel walkthrough/training for client
- [ ] Full source code handover
- [ ] Start of 30-day free support window

## Post-Launch (Optional)
- [ ] Monthly maintenance package (€35-50/month) if client opts in after free support period
