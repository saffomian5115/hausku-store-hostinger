# 🔴 CLIENT PENDING ITEMS — HAUSKU Launch

> Ye folder un **saari cheezon** ki list hai jo **client (Waqar Ali Anjam / NI Intellect UG)** se leni hain.
> Jab client kuch bheje: is folder me tick karo + relevant code/data wire karo.
>
> ## 📄 CLIENT KO YE BHEJO → `client-request.pdf`
> **Sirf 3 critical items** (Stripe keys, AGB sign-off, tracking decision) ka clean English PDF —
> ready to send. Dobara generate karne ke liye: `node client-pending/generate-request-pdf.cjs`
>
> Email text version bhi hai: **`email-to-client.md`**

---

## 🔴 BLOCKERS — In ke bina LAUNCH nahi ho sakta

### 1. 💳 Stripe API Keys (Payment #16)
> Bina is ke koi order hi nahi ho sakta. **Sabse zaroori item.**

| Kya chahiye | Detail |
|---|---|
| Stripe **Test** keys (pehle) | `STRIPE_SECRET_KEY` (sk_test_...), `STRIPE_PUBLISHABLE_KEY` (pk_test_...), `STRIPE_WEBHOOK_SECRET` (whsec_...) |
| Stripe **Live** keys (launch pe) | Same 3 keys, live mode |
| Test card end-to-end test | Keys milne ke baad main test kar lunga (4242 4242 4242 4242) |

**Client ko kya karna hai:** dashboard.stripe.com pe account → Developers → API keys → test keys copy karke bhejna.

### 2. 📜 AGB Final Sign-off (Legal #3)
> AGB text eBay-adapted hai, Händlerbund approval nahi. Legal risk.

- [ ] Client ya Händlerbund se **final AGB approval** (Web-Shop version)
- [ ] Confirm: Datenschutzerklärung actual practices se match karti hai

### 3. 🍪 Tracking / Analytics List (Cookie Consent #22)
> Consent banner ka design is list pe depend karta hai. Abhi koi tracking installed NAHI hai — jahan tak hai "consent not needed", lekin jaise hi client kuch add kare, banner zaroori.

| Kya chahiye | Detail |
|---|---|
| Analytics tools | Google Analytics 4? Google Ads? Meta Pixel? Hotjar? — kaunse? |
| Newsletter provider | Mailchimp / Brevo / koi aur? |
| Chat widget | Koi third-party chat tool? |

### 4. 📦 Return Policy Decisions (#5 in CLIENT-DATA-NEEDED)

| Kya chahiye | Detail |
|---|---|
| Return period confirm | Abhi 30 Tage set hai — final? |
| Return shipping cost | Customer pay kare ya HAUSKU? |
| **Return address** | Returns kahan bhejne hain? (Roggenring 26 theek hai ya warehouse alag?) |

### 5. 🚚 Shipping Config Confirm (#8)

| Kya chahiye | Detail |
|---|---|
| Free shipping threshold | Abhi €30 — confirm? |
| Flat rate | Abhi €4.99 — confirm? |
| Carriers | DHL / Hermes / DPD / GLS? |
| Destinations | Sirf Germany ya EU? |
| Delivery time | "2–3 Werktage" — confirm? |

### 6. ⭐ Reviews Decision (#4)
> Fake/test reviews legally problematic hain (UWG). Decision chahiye:

- [ ] "4.8 / 47 Reviews" ka source kya tha? (Amazon se copy? Hata diya gaya hai)
- [ ] Sirf **real customer reviews** se start karein? (Recommended)
- [ ] Homepage testimonials section abhi khaali/neutral hai — kya dikhaana hai?

---

## 🟡 IMPORTANT — Launch se pehle ideally, quality ke liye zaroori

### 7. 🏷️ Product Data (#7) — *sabse bada content item*

| Kya chahiye | Detail |
|---|---|
| Final product list | Naam, description, price — sab products |
| **Product images** | 1:1 square format, saare products + variants |
| Categories | Final category structure |
| **Specifications** | Dimensions, weight, material — har product ke liye (product detail page ke liye zaroori) |
| SKU confirm | HSK-2401-850/1200/1400 ml, HSK-LPTG-2501, HSK-LPTB-2501, HSK-CBSB-2601 — theek hain? |
| Safety warnings | Per-product GPSR warnings (abhi generic NI Intellect UG data hai) |
| **Stock quantities** | Real inventory numbers har variant ke liye |

### 8. 🏢 Company/Content Chhoti Cheezein

| Kya chahiye | Detail |
|---|---|
| Geschäftszeiten | "Mo–Fr, 9:00–17:00" placeholder hai — confirm karo |
| Versand & Zahlung page | Dedicated page content chahiye ya `/terms#lieferzahlung` anchor theek hai? |
| VAT rate | 19% confirm |
| Admin alert email | saleshub@niintellect.de for orders, ya alag admin@? |
| Team photos | About page (abhi placeholder avatars) |
| Brand story final | About page text approve? |
| Email logo | Transactional emails ke liye logo file (PNG/SVG) |

### 9. 💰 PayPal / Klarna Decision
> Fake checkout remove ho chuka hai — ab sirf Stripe hai. Client decide kare:

- [ ] PayPal chahiye? → Client ID + Secret bheje
- [ ] Klarna chahiye? → Username + Password bheje
- [ ] Ya sirf Stripe (cards + Apple Pay + Google Pay) launch ke liye kaafi? *(Recommended — baad me add ho sakta hai)*

---

## 🟢 HANDOVER — Launch ke baad (official ownership)

| Kya chahiye | Detail |
|---|---|
| Git repo ownership | NI Intellect UG ko transfer/access |
| Hosting account | Vercel/hosting account client ke naam pe |
| Domain | hausku.com registrar access |
| Stripe account | Full account ownership client ka |
| Email domain | niintellect.de mailbox access |
| DB backups | Backup schedule confirm + restore test |

---

## 📊 Summary

| Priority | Items | Status |
|---|---|---|
| 🔴 Blockers | 6 categories | Sab pending |
| 🟡 Important | 3 categories | Sab pending |
| 🟢 Handover | 6 items | Launch ke baad |

**Total: ~35 items pending client side**

> ⚠️ **Ek bhi 🔴 blocker complete nahi hua to launch postpone.** Sabse pehle Stripe keys + AGB sign-off + tracking list bhejwao.
