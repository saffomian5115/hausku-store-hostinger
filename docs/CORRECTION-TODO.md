# HAUSKU Webshop V1 — Correction Report Todo List

> Source: `docs/HAUSKU_Webshop_V1_Correction_Report.pdf`
> Created: 2026-09-16
> Status: All items pending — 33 total corrections

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

### #4 — GPSR Product Information

- [ ] **Structured GPSR fields in admin** — Abhi sirf `manufacturer` (text) + `safetyWarnings` (text) hai. Add karo:
  - Registered/trading name
  - Postal address
  - Email/electronic contact
  - Product type
  - SKU/model identifier (per variant)
  - Safety warnings (structured, not free-text dump)
  - **Location:** `prisma/schema.prisma`, `src/components/admin/ProductForm.tsx`, `src/app/(storefront)/product/[slug]/page.tsx`

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

### #16 — Checkout/Payment Verification

- [ ] **Stripe checkout test** — Currently BLOCKED (placeholder `sk_live_...` keys in `.env`)
  - Client se real test keys leni hain
- [ ] **PayPal/Klarna fake checkout fix** — Abhi order create hota hai + redirect success pe with NO payment taken. Real integration karo ya payment method hide karo.
  - **Location:** `src/lib/payments/index.ts`, checkout page
- [ ] **Sirf active payment methods ke logos dikhao** — Apple Pay/Google Pay ke logos tabhi jab actually supported ho

### #17 — Checkout Final Order Button ✅ DONE

- [x] **Order button wording change** — "Zur Kasse gehen" / "Bestellung aufgeben" → **"Kostenpflichtig bestellen"** (legally appropriate German)
  - **Location:** `src/app/(checkout)/checkout/page.tsx`

### #22 — Privacy, Cookies & Tracking

- [ ] **Confirm all tracking technologies** installed/planned (GA, Ads, GTM, Meta Pixel, Bing, Hotjar, etc.)
- [ ] **Non-essential tracking must not load before consent**
- [ ] **Consent solution** must support: accept, reject, granular selection, withdrawal
- [ ] **Datenschutzerklärung** must accurately reflect actual implementation

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

### #30 — Security & Operational Controls

- [ ] Confirm: HTTPS, password hashing, server-side validation, CSRF, rate limiting, webhook validation
- [ ] Confirm: No secrets client-side exposed, env vars protected
- [ ] Confirm: DB backups, documented restore, staging env, error logging
- [ ] Confirm: Secure sessions, 2FA for admin (if supported)
- [ ] **All production assets owned by NI Intellect UG** (hosting, domain, DB, repo, payment, analytics, email)

### #31 — Source Code Handover

- [ ] NI Intellect UG must receive:
  - Complete application source code
  - Database schema
  - Git repository access/ownership
  - Deployment configuration
  - Environment variable documentation (without exposing secrets)
  - Setup/deployment instructions
  - Dependency list
  - Backup/restore instructions

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

### #12 — Shipping Logic

- [ ] **Fix "Versand: €4.99" hardcoded** in product shipping hint — qualify karta hai to "Kostenloser Versand" dikhao
  - **Location:** `src/locales/de.json` `product.shippingHint`, `src/locales/en.json`
- [ ] **"Noch X bis zum kostenlosen Versand"** progress indicator cart page pe

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

- [ ] All functional (not visual placeholders):
  - Registration, login, logout
  - Incorrect password handling, password reset
  - Customer name editing
  - Address management (CRUD)
  - Order history (completed, cancelled, refunded)
  - Account/data deletion process

### #19 — Invoice System

- [ ] **Confirm**: auto-generation, sequential numbers, VAT correct, PDF, customer download
- [ ] **Add**: Invoice emails to customers
- [ ] **Add**: Accounting export (CSV/PDF) in admin panel

### #20 — Transactional Emails (DE + EN)

- [ ] Account registration confirmation
- [ ] Password reset
- [ ] Order confirmation
- [ ] Successful payment
- [ ] Shipping confirmation (with tracking)
- [ ] Cancellation
- [ ] Refund
- [ ] Return request/confirmation
- [ ] **All emails must be in both German and English**

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

### #24 — Color System & Visual Direction

- [ ] **Replace bright lime/neon green** with HAUSKU design palette:
  - Primary / Forest Green: `#2F6B4F`
  - Primary Hover / Deep Forest: `#25543E`
  - Secondary / Sage Green: `#79A97F`
  - Secondary Light / Soft Sage: `#DDEBD9`
  - Main Background: `#FAFAF7`
  - Section Background: `#FFFFFF`
  - Primary Text: `#1F2933`
  - Secondary Text: `#4B5563`
  - Standard Border: `#E5E7EB`
- [ ] Hero gradient: `#79A97F → #2F6B4F` (not bright lime)
- [ ] Implement via **CSS variables / design tokens** for consistency across:
  - Header, buttons, product cards, badges, forms, footer, checkout, account, alerts
- [ ] **Honeycomb/background pattern opacity reduce** karo
- [ ] Bright lime/neon green should NOT be dominant large-area background

### #25 — Homepage Counters / Server Rendering

- [ ] **StatCounter** initially "0" render karta hai (`src/components/shared/StatCounter.tsx`). Actual values server-side render karo. Animation baad mein enhance kare.
- [ ] Important for accessibility, SEO, slow connections, JS failure

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
| P0 (Launch Blockers) | 16 | 11/16 complete ✅ |
| P1 (Pre-Launch Quality) | 16 | 1/16 complete ✅ |
| P2 (Post-Launch) | 1 | Pending |
| **Total** | **33** | **12/33 complete** |

---

*Last updated: 2026-09-18*
