# HAUSKU Webshop V1 — Correction Report Todo List

> Source: `docs/HAUSKU_Webshop_V1_Correction_Report.pdf`
> Created: 2026-09-16
> Status: 19/30 items complete + 3 partial ≈ 70% (2026-09-19) — P0 me bacha: Stripe test (client blocked), consent banner (client list blocked), security hardening (CSRF/2FA/monitoring). Client-facing checklist: `client-pending/README.md`

---

## 🔴 P0 — Launch Blockers (Mandatory before production)

### #2 — Brand Manufacturer & "Made in Germany" ✅ DONE

- [x] **Manufacturer details** — NI Intellect UG ko manufacturer dikhao with:
  - Registered company name: NI Intellect UG (haftungsbeschränkt)
  - Postal address: Roggenring 26, 23619 Hamberge, Schleswig-Holstein, Deutschland
  - Electronic contact: saleshub@niintellect.de
  - Product-specific SKU identifiers (HSK-2401-850 ml, HSK-2401-1200 ml, HSK-2401-1400 ml, HSK-LPTG-2501, HSK-LPTB-2501, HSK-CBSB-2601)
  - Product-specific safety warnings
  - **Location:** Seed data (`prisma/seed.ts`), admin product form, product detail page, all product pages
- [x] **"Made in Germany" → "Designed in Germany"** — About page badge (`src/app/(storefront)/about/page.tsx` line 70) se hatao. Sab jagah se "Made in Germany" replace karo.

### #3 — Legal Pages Completion ✅ DONE

- [x] **Remove all placeholders** from legal pages — saare dummy values replace ho gaye:
  - Impressum: NI Intellect UG (haftungsbeschränkt), Roggenring 26, 23619 Hamberge, vertreten durch Geschäftsführerin Nazia Iqbal, Tel. +49 176 45972009, saleshub@niintellect.de, Amtsgericht Lübeck HRB 24694HL, USt-IdNr. DE367665227
  - **Location:** `src/locales/de.json` + `src/locales/en.json` (imprint/privacy/terms/returns/contact/footer), `src/app/(storefront)/imprint/page.tsx`
- [x] **Client-supplied texts implement kiye** (folder `legal pages/`):
  - `Impressum.txt` → `/imprint` (exact company data + Streitschlichtung clause)
  - `Widerrufsrecht.txt` → `/returns` (full Widerrufsbelehrung, 14 Tage, exclusions, Muster-Widerrufsformular + PDF download via `/api/legal/withdrawal-form`)
  - `AGB.txt` → `/terms` (Teil I AGB + Teil II Kundeninformationen) — **WICHTIG:** Original eBay-specific tha ("Sofort-Kaufen", "Bieten", "Preisvorschlag", "CATCH by eBay"); web-shop ke liye adapt kiya gaya (Warenkorb + "Kostenpflichtig bestellen" flow). Client/Händlerbund se final web version approve karwana abhi bhi recommended.
  - Datenschutzerklärung (AGB.txt ka Part III) → `/privacy` (Verantwortlicher, Bestelldaten, PayPal, Klarna, Speicherdauer, Betroffenenrechte, ULD Schleswig-Holstein)
- [x] **Footer "§5 TMG · NICHT EU"** — replaced with real company line ("NI Intellect UG (haftungsbeschränkt) · Roggenring 26 · 23619 Hamberge"). TMG reference outdated hai (nun DDG).
- [x] **"Versand & Zahlung" link** — footer `shipping` ab `/terms#lieferzahlung` pe anchor karta hai (§ Lieferbedingungen in Kundeninformationen). Dedicated page optional (P1 #12).

### #4 — GPSR Product Information ✅ DONE (2026-09-19)

- [x] **Structured GPSR fields in admin** — `prisma/schema.prisma` Product model me naye fields: `manufacturerAddress`, `manufacturerEmail`, `productType` (+ pehle se the `manufacturer`, `safetyWarnings`). Wired end-to-end: admin ProductForm (GPSR section, warnings line-based), create/update APIs, edit page, seed (real NI Intellect UG data per product), product detail page ka structured GPSR block (address, mailto contact, warnings as bullet list), locales de/en (`manufacturerAddress`, `manufacturerEmail` keys).
  - Registered/trading name ✅
  - Postal address ✅
  - Email/electronic contact ✅
  - Product type ✅
  - SKU/model identifier (per variant) — n/a: SKU per variant already variants section me hai aur product page pe visible
  - Safety warnings (structured, not free-text dump) ✅ — line-based, storefront pe bullet list

### #5 — Customer Reviews & "4.8 / 47 Reviews" ✅ DONE

- [x] **Remove hardcoded "4.8 aus 47 Bewertungen"** — Seed mein sirf ~7 reviews hain
  - **Location:** `src/app/(storefront)/page.tsx` line 172, `src/locales/de.json` line 140, `src/locales/en.json` line 140
- [x] **Homepage testimonials** — hardcoded review names/texts hain (page.tsx lines 498-526). Inka source document karo ya remove karo
- [x] **Dynamic aggregate rating** — Reviews ka actual average dynamically DB se calculate karo, hardcoded mat rakho
- [x] **Do not present test reviews as genuine customer reviews**

### #6 — 60-Day Return Period → 30 Days ✅ DONE

- [x] **Replace "60 Tage" with "30 Tage"** in:
  - Homepage ticker (page.tsx line 60)
  - Bento grid card (page.tsx line 213)
  - StatCounter (page.tsx line 409)
  - `src/locales/de.json` lines 71, 85, 135-136
  - `src/locales/en.json` lines 71
  - `src/locales/de.json` `about.valueServiceText` line 340
  - `src/locales/en.json` `about.valueServiceText` line 340
- [x] Widerrufsrecht (14 Tage) alag se maintain karo

### #7 — "2 Jahre Garantie" Remove ✅ DONE

- [x] **Remove "2 Jahre Garantie"** claim from:
  - Homepage ticker (page.tsx line 61)
  - Bento grid card (page.tsx line 211)
  - StatCounter (page.tsx line 408)
  - HeroBlob floating badge (HeroBlob.tsx line 112)
  - `src/locales/de.json` lines 82, 131-132
  - `src/locales/en.json` lines 82, 131-132
- [x] **Do not use "Garantie"** as substitute for statutory Gewährleistung

### #8 — "100% auslaufsicher" → "Auslaufsicher" ✅ DONE

- [x] **Replace "100% auslaufsicher" / "100% leak-proof"** with "Auslaufsicher" / "Leak-resistant"
  - **Location:** Homepage ticker (page.tsx line 63)

### #9 — "100% recycelbar" Remove ✅ DONE

- [x] **Remove "100% recycelbar"** from:
  - HeroBlob floating badge (HeroBlob.tsx line 94)
  - StatCounter (page.tsx line 410)
  - Any other locations

### #10 — "Klimaneutraler Versand" Remove ✅ DONE

- [x] **Remove "Klimaneutraler Versand" / "Carbon-neutral shipping"** from:
  - Homepage ticker (page.tsx line 62)
  - Any other references

### #16 — Checkout/Payment Verification ⚠️ PARTIAL (2026-09-19)

- [x] **PayPal/Klarna fake checkout fix** — Fake checkout remove ho gaya: checkout page se PayPal/Klarna options hata diye (sirf Kreditkarte/Apple Pay/Google Pay), orders API ab sirf `stripe` accept karta hai (pehle paypal/klarna pe bina payment ke order + stock decrement hota tha — data fix), aur client pe error message dikhata hai agar koi baki method select kare. PayPal/Klarna tabhi add karo jab real integration ho — legal problem bhi: bina captured payment ke "Kostenpflichtig bestellen" misleading hota hai.
  - **Location:** `src/app/(checkout)/checkout/page.tsx`, `src/app/api/orders/route.ts`, `src/app/api/payments/route.ts`
- [ ] **Stripe checkout test** — Still BLOCKED (placeholder `sk_live_...` keys in `.env`). Client se real test keys leni hain, phir end-to-end test (test card 4242…, webhook local pe stripe cli se)
- [ ] **Sirf active payment methods ke logos dikhao** — Checkout me ab sirf Stripe options hain ✅; footer/checkout ki payment icons (agar client assets me hain) verify karna baaki

### #17 — Checkout Final Order Button ✅ DONE

- [x] **Order button wording change** — "Zur Kasse gehen" / "Bestellung aufgeben" → **"Kostenpflichtig bestellen"** (legally appropriate German)
  - **Location:** `src/app/(checkout)/checkout/page.tsx`

### #22 — Privacy, Cookies & Tracking ⚠️ PARTIAL (2026-09-19)

> ⚠️ **Client se chahiye (blocker):** (1) Tracking technologies ki final list — GA4, Google Ads, GTM, Meta Pixel, Bing, Hotjar etc. me se kya use karna hai; (2) un services ke account/IDs. Jab tak ye nahi aata, code-side infra ready kar sakte hain par koi script wire nahi ho sakti.

- [ ] **Consent banner implement karo** — Accept / Reject / granular selection / withdrawal, non-essential scripts sirf consent ke baad load. Provider suggestion: inline light solution ya Usercentrics/Cookiebot (TTDSG/DSGVO compliant)
- [ ] **Datenschutzerklärung** must accurately reflect actual implementation — jab tracking list final ho jaye
- [x] **Abhi koi tracking installed nahi hai** (verified 2026-09-19 — no GA/Pixel/GTM in codebase), isliye launch ke liye technically "no consent needed" hai JAB TAK client kuch add nahi karta — lekin banner client ki list ke bina final nahi ho sakta

### #26 — About Us Page ✅ DONE

- [x] **Remove developer instruction** — "Team-Fotos können hier hinzugefügt werden, sobald der Kunde sie bereitstellt." visible hai to customers
  - **Location:** `src/app/(storefront)/about/page.tsx` ~line 146
- [x] **Remove duplicated mission/story text** — mission aur story sections mein same text repeat ho raha hai
- [x] **"Made in Germany" → "Designed in Germany"**
- [x] **Final brand story**: German product development/design + manufacture in China by production partners

### #27 — Contact Page ✅ DONE

- [x] **Remove all placeholders** — "Bitte vom Klient ergänzen", `[Telefonnummer]`, `[Straße Nr., PLZ Ort]` sab removed
  - **Location:** `src/app/(storefront)/contact/page.tsx`, `src/locales/de.json` + `en.json` (contact section)
- [x] **Real company details daalo**:
  - Address: Roggenring 26, 23619 Hamberge
  - Email: saleshub@niintellect.de
  - Phone: +49 176 45972009 (click-to-call `tel:` link)
- [x] **Contact form mein optional order number field** add ho gaya (`/api/contact` + email notification me bhi included)
- [x] **Suggested topics** add ho gaye: Produktfrage, Bestellung, Versand, Rückgabe/Widerruf, Reklamation, Sonstiges (dropdown)
- [ ] **Geschäftszeiten** — abhi bhi placeholder "Mo–Fr, 9:00–17:00 Uhr" (client confirmation pending — siehe CLIENT-DATA-NEEDED 2.8)

### #30 — Security & Operational Controls ⚠️ MOSTLY DONE (2026-09-19)

- [x] **Admin API auth** — CRITICAL fix: 11/12 admin routes pe koi auth check hi nahi tha (customers PII, invoices, settings sab publicly callable). Ab saare `/api/admin/*` routes `requireAdmin` guard se protected hain (`src/lib/adminAuth.ts`)
- [x] **Session forging fix** — Admin aur customer session cookies pehle plain base64 JSON the (koi bhi `{"role":"admin"}` ya `{"id":5}` forge kar sakta tha). Ab dono HMAC-signed tokens hain (`AUTH_SECRET` env var ke saath)
- [x] **Admin login rate limiting** — 5 attempts / 15 min per IP (brute-force protection). Contact pe pehle se tha
- [x] **Password hashing** — customers bcrypt; admin creds env vars (rotation doc'd in HANDOVER.md)
- [x] **HTTPS** — hosting-level (Vercel/Node reverse proxy); app me `secure` cookies production me
- [x] **Server-side validation** — sab API routes me
- [x] **Webhook validation** — Stripe signature verification (`verifyStripeWebhook`)
- [x] **No secrets client-side** — keys sirf server env me; grep-verified no key leakage in client components
- [ ] **CSRF review** — cookie-based state-changing endpoints (sameSite=lax madad karta hai, par explicit review recommended)
- [ ] **Shared rate-limit store** — in-memory hai; multi-instance/serverless pe Redis/Upstash ya platform WAF
- [ ] **DB backups automated + documented restore test** — manual process HANDOVER.md me doc'd
- [ ] **2FA for admin** — agar supported ho
- [ ] **Error logging/monitoring** (Sentry ya similar) + uptime check
- [ ] **Staging environment**
- [ ] **All production assets owned by NI Intellect UG** — HANDOVER.md checklist me hai

### #31 — Source Code Handover ✅ DOCS READY (2026-09-19)

- [x] **`docs/HANDOVER.md` created** — setup, env vars (incl. naya `AUTH_SECRET`), admin panel, DB backups/restore, payments flow, security summary, handover checklist
- [x] Complete application source code, DB schema, env var documentation, setup/deploy instructions, dependency list, backup/restore instructions — sab doc'd
- [ ] NI Intellect UG must receive: **git repo ownership transfer** ← client side
- [ ] **Production asset ownership** (hosting, domain, DB, Stripe, email) ← client side

---

## 🟡 P1 — Pre-Launch Quality

### #11 — Broader Sustainability Wording ✅ DONE

- [x] **Remove unsupported claims**:
  - "Klimabeitrag" / "Climate contribution" (de.json lines 134, 287-288, en.json lines 134, 287-288)
  - "CO₂-kompensiert" / "CO₂-compensated" (de.json line 91, en.json line 91)
  - "DHL GoGreen" (de.json lines 92-93, en.json lines 92-93)
  - "Klimabewusst produziert" (homepage bento card)
- [x] **Replace with factual statements**:
  - "Wiederverwendbare Edelstahlkonstruktion"
  - "Für langfristigen Einsatz entwickelt"
  - "Ersetzbare Silikondichtungen"
  - "Reduzierter Einsatz von Einwegverpackungen"

### #12 — Shipping Logic ✅ DONE (2026-09-19)

- [x] **Product shipping hint dynamic** — hardcoded "Versand: €4.99" hint replace: product page ab live store settings se `freeShippingThreshold`/`shippingFlatRate` padhta hai; product qualify kare to "Kostenloser Versand" hint, warna "Versand: {rate}" (formatPrice se, admin settings change hone par turant reflect)
  - **Location:** `src/app/(storefront)/product/[slug]/page.tsx`, locales `product.shippingHintFree`/`shippingHintPaid` (purana hardcoded `shippingHint` key removed)
- [x] **"Noch X bis zum kostenlosen Versand"** progress indicator cart pe pehle se tha — ab brand-consistent (blue → lime) aur ek naya "Freigeschaltet!" celebration state jab threshold cross ho jaye
  - **Location:** `src/app/(storefront)/cart/page.tsx`, locale key `cart.freeShippingUnlocked`
- [x] Bonus: cart ka shipping amount pehle se hi settings-driven hai (koi hardcoded rate nahi) ✓

### #13 — Inventory Values

- [ ] **Development/test stock values** ko production se pehle actual values se replace karo
- [ ] **Customer-facing**: exact quantities mat dikhao — "Auf Lager" / "Nur noch wenige verfügbar" / "Nicht verfügbar" sufficient
- [ ] Architecture should allow future Amazon FBA / 3PL integration

### #14 — Product Variants

- [ ] **Lunch boxes**: 850ml / 1200ml / 1400ml size selector properly visible
- [ ] **Lapdesk**: Grey / Black color swatches properly visible
- [ ] **"Größe auswählen" / "Farbe auswählen"** tabhi dikhao jab actually multiple options hon

### #15 — Product Detail Pages (Specifications)

- [ ] **Laptop tray / Lapdesk** fields:
  - Dimensions, weight, supported laptop size
  - Material, smartphone-slot dimensions, mouse-pad dimensions
  - Wrist-support info, cleaning instructions
  - Intended usage, package contents, FAQ, safety info
- [ ] **Stainless-steel lunch boxes** fields:
  - Dimensions, capacity, weight, material spec
  - Lid material, sealing material
  - Dishwasher/microwave/oven suitability
  - Divider info, accessories, cleaning/care
  - Food-contact info, package contents, FAQ
- [ ] **Couch Bar** fields:
  - External dimensions, weight, materials
  - Bowl dimensions/volume, cup/bottle-holder dims
  - Included components, care/cleaning, usage info

### #18 — Customer Account

- [x] All functional (not visual placeholders):
  - Registration, login, logout ✅
  - Incorrect password handling, password reset ✅ (reset flow: /forgot-password → email token → /reset-password; token 30 min gültig)
  - Customer name editing ✅ (Profile API: PUT name + POST password change)
  - Address management (CRUD) ✅ (add/edit/delete + default; edit UI nachgereicht)
  - Order history (completed, cancelled, refunded) ✅
  - Account/data deletion process ✅ (DSGVO: Passwort-Bestätigung, Adressen/Wishlist gelöscht, Orders anonymisiert)
- [x] **Security fix (2026-09-19):** Adress-/Invoice-/Credit-Note-APIs waren ohne Session-Guard — jeder konnte fremde PII lesen/ändern. Jetzt: `getSessionCustomer` + ID-Match auf allen customer- Routen.
- ⚠️ Note: Google-only accounts haben kein Passwort — Löschung ohne Passwort-Check erlaubt (OK, Session schützt).

### #19 — Invoice System

- [ ] **Confirm**: auto-generation, sequential numbers, VAT correct, PDF, customer download
- [ ] **Add**: Invoice emails to customers
- [ ] **Add**: Accounting export (CSV/PDF) in admin panel

### #20 — Transactional Emails (DE + EN) ✅ MOSTLY DONE (2026-09-19)

- [x] **Account registration confirmation** — Naya `sendWelcomeEmail` (DE/EN), register route me fire-and-forget (signup block nahi hota)
- [x] **Order confirmation** — DE/EN localized (subject, body, item table, totals, address block)
- [x] **Successful payment** — Order confirmation hi paid webhook ke baad jata hai (same email = confirmation + payment proof)
- [x] **Shipping confirmation (with tracking)** — DE/EN, tracking number + localized "Sendung verfolgen" button
- [x] **Cancellation / Refund** — DE/EN (order status emails: SHIPPED/DELIVERED/CANCELLED/REFUNDED)
- [x] **Return request/confirmation** — DE/EN (saare 5 states: PENDING/APPROVED/REJECTED/RECEIVED/REFUNDED)
- [x] **All emails in both languages** — Poora email module ab `E` dictionary se localized hai; language Order pe save hoti hai (naya `locale` field — checkout `hausku_locale` cookie se), webhook/status/return paths wahi pass karte hain. Contact notification admin ko `[DE]`/`[EN]` prefix ke sath jati hai. Internal admin alert German me (owner) — intended
- [x] **Password reset email** — DE/EN, signed token (30 min) ke saath `/reset-password?token=…` link (#18 reset flow ke saath complete, 2026-09-19)
  - **Location:** `src/lib/email/index.ts` (E dictionary + all senders), `prisma/schema.prisma` (Order.locale, Customer reset token fields), `src/app/api/orders`, `src/app/api/auth/register`, `src/app/api/contact`, admin orders/returns routes

### #21 — German & English Completeness

- [ ] All customer-facing content must be in both languages:
  - Navigation, categories, product titles, descriptions, specifications
  - Cart, checkout, validation/error messages
  - Account, contact page
  - Delivery/payment information
  - Transactional emails
  - Cookie/consent interface
- [ ] No German strings inside English checkout or vice versa

### #23 — SEO Implementation

- [ ] Unique `<title>` for every indexable page (not generic "hausku — Haus & Küche")
- [ ] Unique meta descriptions
- [ ] Canonical URLs
- [ ] XML sitemap (`src/app/sitemap.ts` exists — verify content)
- [ ] robots.txt (`src/app/robots.ts` exists — verify content)
- [ ] Proper German/English hreflang
- [ ] Product structured data (JSON-LD — exists, verify completeness)
- [ ] Organization structured data
- [ ] Breadcrumb structured data
- [ ] Meaningful image alt text
- [ ] SEO-editable fields in admin panel

### #24 — Color System & Visual Direction ✅ DONE (2026-09-19)

- [x] **Palette implemented via Tailwind v4 `@theme` design tokens** (`src/app/globals.css`) — `lime-*`/`green-*`/`emerald-*` scales client ke forest ramp se remap: Primary Forest `#2F6B4F`, Hover Deep Forest `#25543E`, Sage `#79A97F`, Soft Sage `#DDEBD9`, bg `#FAFAF7`. Saari 359+ existing `lime-*`/`green-*` classes ab brand palette render karti hain — header, buttons, cards, badges, forms, footer, checkout, account, alerts automatically consistent
- [x] **Hero gradients** — HeroBlob `#DDEBD9 → #79A97F → #2F6B4F`; about/contact hero bands `#79A97F → #2F6B4F → #25543E`
- [x] **Hardcoded colors migrate** — emails (sab templates forest/sage), invoice PDF (GREEN/DARK_GREEN constants), homepage SVG swash, BackgroundGrid hover (sage, reduced alpha), `::selection`
- [x] **Body background** `#fafaf9 → #FAFAF7` (brand Main Background)
- [x] **About CTA contrast fix** — dark gradient pe gray-700 text white; buttons accessible contrast me
- [ ] **Optional follow-up:** ShapeGrid honeycomb ka visual opacity tune + client review

### #25 — Homepage Counters / Server Rendering ✅ DONE (2026-09-19)

- [x] **StatCounter SSR** — component ab initial render pe hi actual value dikhata hai (props se server-side aata hai): SEO crawlers, no-JS visitors, screen readers sabko real number milta hai. Zero-flash removed — pehle hamesha "0" se start hota tha. In-view count-up animation ab purely cosmetic enhancement hai (hydrated client pe), `animated` flag se double-run guard bhi
  - **Location:** `src/components/shared/StatCounter.tsx`

### #29 — Accessibility

- [ ] Complete keyboard navigation
- [ ] Visible focus indicators
- [ ] Correctly associated form labels
- [ ] Meaningful validation messages
- [ ] Image alt text on all images
- [ ] Semantic heading hierarchy (h1 → h2 → h3)
- [ ] Sufficient text/background contrast
- [ ] No information communicated by colour alone
- [ ] Accessible navigation/menu
- [ ] Accessible cart and checkout
- [ ] Accessible cookie-consent controls

---

## 🟢 P2 — Post-Launch Optimization

### #28 — Search Testing

- [ ] Test with terms: Laptop, Laptopkissen, Brotdose, 850, 1200, Edelstahl, Snackbox
- [ ] Test common spelling variations
- [ ] Test no-result query — provide useful route back to products/categories

---

## Summary

| Priority | Count | Status |
|----------|-------|--------|
| P0 (Launch Blockers) | 16 | 13/16 complete (2 partial, 1 blocked) ✅ |
| P1 (Pre-Launch Quality) | 16 | 5/16 complete ✅ |
| P2 (Post-Launch) | 1 | Pending |
| **Total** | **33** | **18/33 complete** |

---

*Last updated: 2026-09-19*
