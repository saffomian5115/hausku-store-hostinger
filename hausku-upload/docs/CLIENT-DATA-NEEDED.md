# HAUSKU — Client Data Requirements

> Ye file un sab data ki list hai jo **NI Intellect UG (Waqar Ali Anjam)** se chahiye website complete karne ke liye.
> Jab bhi client kuch provide kare, is file mein se tick karte jao.
>
> 📁 **Client-facing versions:** `client-pending/README.md` (checklist) + `client-pending/email-to-client.md` (ready-to-send email) — ye dono files client ko directly bheji ja sakti hain.

---

## 🔴 P0 — Launch Blockers (Must have before production)

### 1. Legal Pages — Händlerbund Texts

> ✅ Client ne `legal pages/` folder me texts provide kar diye (Impressum.txt, AGB.txt, Widerrufsrecht.txt) — website me implement ho gaye (2026-09-18).

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 1.1 | **Datenschutzerklärung (Privacy Policy)** — Händlerbund approved text | ✅ Received & Implemented | AGB.txt ke andar Datenschutzerklärung thi → `/privacy` |
| 1.2 | **Impressum** — Händlerbund approved text with real company details | ✅ Received & Implemented | Impressum.txt → `/imprint` |
| 1.3 | **AGB (Terms & Conditions)** — Händlerbund approved text | ✅ Received & Implemented | AGB.txt → `/terms` (eBay → Web-Shop adaptiert; final approval recommended) |
| 1.4 | **Widerrufsbelehrung (Returns/Withdrawal Policy)** — Händlerbund approved text including Muster-Widerrufsformular | ✅ Received & Implemented | Widerrufsrecht.txt → `/returns` + PDF (`/api/legal/withdrawal-form`) |
| 1.5 | **Versand & Zahlung (Shipping & Payment)** — Dedicated page content | ⏳ Pending | Abhi AGB page ke Lieferbedingungen anchor pe link hai (`/terms#lieferzahlung`) |

### 2. Company Details (for Impressum, Contact, GPSR)

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 2.1 | **Registered company name** | ✅ Confirmed | NI Intellect UG (haftungsbeschränkt) |
| 2.2 | **Full postal address** | ✅ Confirmed | Roggenring 26, 23619 Hamberge, Deutschland |
| 2.3 | **Contact email** | ✅ Confirmed | saleshub@niintellect.de |
| 2.4 | **Phone number** | ✅ Confirmed | +49 176 45972009 |
| 2.5 | **Geschäftsführer (Managing Director) name** | ✅ Confirmed | Nazia Iqbal |
| 2.6 | **Handelsregister (Commercial Register) number** | ✅ Confirmed | HRB 24694HL, Amtsgericht Lübeck |
| 2.7 | **Umsatzsteuer-ID (VAT ID)** | ✅ Confirmed | DE367665227 |
| 2.8 | **Geschäftszeiten (Business Hours)** — Currently "Mo–Fr, 9:00–17:00 Uhr" (placeholder) | ⏳ Pending | Contact page pe abhi bhi placeholder hai |

### 3. Payment Gateway — Real API Keys

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 3.1 | **Stripe Secret Key** — Current `.env` has placeholder `sk_live_...` | ⏳ Pending | |
| 3.2 | **Stripe Publishable Key** — Current `.env` has placeholder `pk_live_...` | ⏳ Pending | |
| 3.3 | **Stripe Webhook Secret** — Current `.env` has placeholder `whsec_...` | ⏳ Pending | |
| 3.4 | **PayPal Client ID** — If PayPal should be active | ⏳ Pending | |
| 3.5 | **PayPal Client Secret** — If PayPal should be active | ⏳ Pending | |
| 3.6 | **Klarna Username** — If Klarna should be active | ⏳ Pending | |
| 3.7 | **Klarna Password** — If Klarna should be active | ⏳ Pending | |

> ⚠️ **Note:** PayPal and Klarna checkout are currently fake (no payment taken). Real integration needed before launch.

### 4. Reviews Source Clarification

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 4.1 | **Source of "4.8 from 47 reviews"** — Where did these reviews come from? | ⏳ Pending | |
| 4.2 | **Are these Amazon reviews?** — If yes, can they be used on hausku.com? | ⏳ Pending | |
| 4.3 | **Which product does each review belong to?** — Currently mixed | ⏳ Pending | |
| 4.4 | **Approved review source for website** — Or should we start fresh with real customer reviews only? | ⏳ Pending | |

### 5. Return Policy Duration

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 5.1 | **Voluntary return period** — Currently set to 30 Tage. Confirm? | ⏳ Pending | |
| 5.2 | **Return shipping costs** — Who pays? Customer or HAUSKU? | ⏳ Pending | |
| 5.3 | **Return address** — Where should returns be sent? | ⏳ Pending | |

### 6. Cookie Consent & Tracking

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 6.1 | **Which analytics/tracking will be used?** — Google Analytics, Google Ads, GTM, Meta Pixel, Hotjar, etc.? | ⏳ Pending | |
| 6.2 | **Newsletter provider** — Mailchimp, Brevo, or other? | ⏳ Pending | |
| 6.3 | **Any third-party chat tools?** | ⏳ Pending | |

---

## 🟡 P1 — Pre-Launch Quality

### 7. Product Data

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 7.1 | **Final product list** — All products with names, descriptions, prices | ⏳ Pending | |
| 7.2 | **Product images** — Square 1:1 format for product cards | ⏳ Pending | |
| 7.3 | **Product categories** — Final category list | ⏳ Pending | |
| 7.4 | **Product specifications** — Dimensions, weight, materials for each product type | ⏳ Pending | |
| 7.5 | **GPSR SKU identifiers** — Confirm SKUs: HSK-2401-850 ml, HSK-2401-1200 ml, HSK-2401-1400 ml, HSK-LPTG-2501, HSK-LPTB-2501, HSK-CBSB-2601 | ⏳ Pending | |
| 7.6 | **Safety warnings per product** — Product-specific GPSR warnings | ⏳ Pending | |
| 7.7 | **Stock quantities** — Real inventory numbers for each variant | ⏳ Pending | |

### 8. Shipping Configuration

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 8.1 | **Free shipping threshold** — Currently €30. Confirm? | ⏳ Pending | |
| 8.2 | **Flat rate shipping cost** — Currently €4.99. Confirm? | ⏳ Pending | |
| 8.3 | **Shipping carriers** — DHL, Hermes, DPD, GLS, Deutsche Post? | ⏳ Pending | |
| 8.4 | **Shipping destinations** — Germany only or EU-wide? | ⏳ Pending | |
| 8.5 | **Shipping times** — "2-3 business days" confirmed? | ⏳ Pending | |

### 9. VAT Configuration

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 9.1 | **VAT rate** — Currently 19%. Confirm? | ⏳ Pending | |
| 9.2 | **VAT ID** — Same as Umsatzsteuer-ID above | ⏳ Pending | |

### 10. Email Configuration

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 10.1 | **Admin alert email** — Currently info@hausku.com. Separate admin@ needed? | ⏳ Pending | |
| 10.2 | **Email branding** — Logo, colors for transactional emails | ⏳ Pending | |

### 11. Content & Branding

| # | Data Needed | Status | Client Response |
|---|-------------|--------|-----------------|
| 11.1 | **Team photos** — For About page (currently placeholder avatars) | ⏳ Pending | |
| 11.2 | **Brand story** — Final text for About page | ⏳ Pending | |
| 11.3 | **Newsletter content** — What to include in newsletters? | ⏳ Pending | |

---

## 📋 Summary

| Category | Items | Pending |
|----------|-------|---------|
| Legal Pages (Händlerbund) | 5 | 1 |
| Company Details | 8 | 1 |
| Payment API Keys | 7 | 7 |
| Reviews Clarification | 4 | 4 |
| Return Policy | 3 | 3 |
| Cookie/Tracking | 3 | 3 |
| Product Data | 7 | 7 |
| Shipping Config | 5 | 5 |
| VAT Config | 2 | 0 (VAT ID confirmed: DE367665227) |
| Email Config | 2 | 2 |
| Content & Branding | 3 | 3 |
| **Total** | **49** | **37** |

---

## 📧 How to Send This to Client

Copy the sections above and send to Waqar Ali Anjam via email or WhatsApp:

> "Hey Waqar, to complete the HAUSKU webshop for launch, we need the following from your side. Please provide when you can — especially the Händlerbund legal texts and Stripe API keys are critical blockers."

---

*Last updated: 2026-09-18*
