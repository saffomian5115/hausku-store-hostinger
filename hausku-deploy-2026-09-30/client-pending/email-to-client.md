# ✉️ Email to Client — Ready to Send

> Neeche wala poora text copy karke email/WhatsApp pe send kar do.
> Subject line bhi di hai. Chaho to adjust kar lena.

---

**Subject:** HAUSKU Webshop — Launch ke liye humein ye cheezein chahiye (Checklist)

---

Hallo Waqar / Guten Tag,

HAUSKU webshop ki development kaafi aage nikal gayi hai — **legal pages, payments infrastructure, security, emails, aur poori design system complete ho chuki hai**. Ab launch se pehle kuch **decision aur data aapki taraf se chahiye**.

Main ne neeche sab kuch list kar diya hai — **priority ke hisaab se**. Sabse upar wale 3 items **launch blockers** hain, in ke bina website live nahi ho sakti.

---

## 🔴 1. SABSE ZAROORI — Launch Blockers

### 💳 A. Stripe API Keys (Payments)
Bina payment ke koi order nahi ho sakta — ye sabse critical item hai.

Aap ko Stripe dashboard se ye keys bhejni hain (test mode pehle, launch pe live):
- `STRIPE_SECRET_KEY` (sk_test_...)
- `STRIPE_PUBLISHABLE_KEY` (pk_test_...)
- `STRIPE_WEBHOOK_SECRET` (whsec_...)

**Kaise:** dashboard.stripe.com → Developers → API Keys → Test keys copy karein.

### 📜 B. AGB Final Approval (Legal)
Aap ne Händlerbund ke texts diye the, lekin AGB **eBay version se Web-Shop me adapt** kiya gaya hai. Legal safety ke liye:
- Händlerbund ya khud se **final AGB approval** de dein (Web-Shop version ke liye)
- Confirm karein ke Datenschutzerklärung aap ki actual practices se match karti hai

### 🍪 C. Tracking & Analytics Decision (Cookie Consent)
Germany me cookie consent banner legally required hai **agar** website pe tracking ho. Abhi humne koi tracking install nahi ki. Aap bata dein:

- [ ] **Google Analytics 4** chahiye? (Ya koi aur analytics — Google Ads, Meta Pixel, Hotjar?)
- [ ] **Newsletter** ke liye kaunsa service? (Mailchimp, Brevo, koi aur?)
- [ ] Koi **chat widget** chahiye website pe?

*(Agar kuch bhi nahi chahiye, to bhi likh dein "no tracking" — hum banner skip kar denge.)*

---

## 🟠 2. Decisions Chahiye (5 minute ka kaam aap ke liye)

| # | Question | Humne abhi kya set kiya hai |
|---|----------|---------------------------|
| 1 | **Return period** kitne din? | 30 Tage |
| 2 | **Return shipping** kaun pay karega? | Customer (AGB ke mutabiq) |
| 3 | **Returns kahan bhejein?** | Roggenring 26, 23619 Hamberge |
| 4 | **Free shipping threshold**? | €30 |
| 5 | **Shipping flat rate**? | €4.99 |
| 6 | **Carrier** kaunsa? | DHL (sirf Germany) |
| 7 | **Lieferzeit**? | 2–3 Werktage |
| 8 | **VAT rate**? | 19% |
| 9 | **Geschäftszeiten** contact page ke liye? | Mo–Fr, 9:00–17:00 (placeholder) |
| 10 | **PayPal / Klarna** launch me chahiye? | Abhi sirf Stripe (Karte, Apple Pay, Google Pay) — recommended |

Har item pe ✅ ya apna value likh kar wapas bhej dein.

---

## 🟡 3. Content & Data (Website quality ke liye)

### 🏷️ Products
- **Final product list** — naam, description, price (sab products)
- **Product photos** — square 1:1 format, har product + variant ke liye
- **Specifications** — dimensions, weight, material (product detail pages ke liye)
- **Stock quantities** — real inventory numbers
- **SKU confirmation** — HSK-2401-850/1200/1400, HSK-LPTG-2501, HSK-LPTB-2501, HSK-CBSB-2601 theek hain?
- **Safety warnings** — har product ke liye (GPSR)

### ⭐ Reviews
Purane "4.8 / 47 Reviews" legally problematic the (source unclear) — humne hata diye.
- Kya hum **sirf real customer reviews** se start karein? *(Recommended)*
- Ya aap apni approved reviews list bhejenge?

### 🖼️ Branding
- **Team photos** — About page ke liye (abhi placeholders hain)
- **Logo file** — transactional emails ke liye (PNG/SVG)
- **Brand story** — About page ka final text approve kar dein

### 📧 Email Setup
- Admin alerts kahan jaayein? `saleshub@niintellect.de` theek hai ya alag `admin@` chahiye?

---

## 🟢 4. Handover (Launch ke baad)

Ye items launch ke **baad** karne hain, par pehle se plan kar lein:

- Git repository ownership transfer (NI Intellect UG ke naam)
- Hosting account (client ownership)
- Domain `hausku.com` registrar access
- Stripe account ownership
- Email domain access

---

## 📌 Aap se request

**Is week** ke andar 🔴 wale 3 items (Stripe keys, AGB approval, Tracking decision) bhej dein — in ke bina launch date decide nahi ho sakti. Baaki items bhi jaldi jitna ho sake.

Agar kisi item me confusion ho ya koi sawal ho, to bas reply kar dein — main explain kar dunga.

Shukriya! 🙏

---

*Generated: 2026-09-19 · HAUSKU Development Team*

---
---

## 📧 German Version (agar client German me chahe)

**Betreff:** HAUSKU Webshop — Für den Launch benötigte Punkte (Checkliste)

---

Hallo Waqar,

der HAUSKU-Webshop ist Entwicklungstechnisch weit fortgeschritten — **Rechtsseiten, Zahlungs-Infrastruktur, Sicherheit, E-Mails und das komplette Design-System sind fertig**. Bis zum Launch benötigen wir noch einige **Entscheidungen und Daten von Ihrer Seite**.

### 🔴 1. Kritisch (Launch-Blocker)

**A. Stripe API-Keys (Zahlungen)**
Ohne Zahlungsfunktion keine Bestellungen. Bitte aus dem Stripe-Dashboard (dashboard.stripe.com → Entwickler → API-Keys) im Testmodus:
- `STRIPE_SECRET_KEY` (sk_test_...)
- `STRIPE_PUBLISHABLE_KEY` (pk_test_...)
- `STRIPE_WEBHOOK_SECRET` (whsec_...)

**B. AGB — finale Freigabe**
Die AGB wurden vom eBay-Muster auf den Web-Shop angepasst. Bitte final absegnen (Händlerbund oder selbst).

**C. Tracking & Analytics (Cookie-Banner)**
Ein Cookie-Consent-Banner ist in Deutschland gesetzlich nötig, sobald Tracking eingesetzt wird. Aktuell ist **kein** Tracking installiert. Bitte entscheiden:
- [ ] Google Analytics 4? (oder Google Ads / Meta Pixel / Hotjar?)
- [ ] Newsletter-Anbieter? (Mailchimp, Brevo, …?)
- [ ] Chat-Widget gewünscht?

*(Falls nichts gewünscht: kurz „kein Tracking" antworten.)*

### 🟠 2. Entscheidungen (5 Minuten)

| # | Frage | Aktuell eingestellt |
|---|-------|--------------------|
| 1 | Rückgabefrist? | 30 Tage |
| 2 | Rücksendekosten trägt? | Kunde (lt. AGB) |
| 3 | Rücksendeadresse? | Roggenring 26, 23619 Hamberge |
| 4 | Versandkostenfrei ab? | 30 € |
| 5 | Versandpauschale? | 4,99 € |
| 6 | Versanddienstleister? | DHL (nur Deutschland) |
| 7 | Lieferzeit? | 2–3 Werktage |
| 8 | Mehrwertsteuersatz? | 19 % |
| 9 | Geschäftszeiten (Kontaktseite)? | Mo–Fr, 9–17 Uhr (Platzhalter) |
| 10 | PayPal/Klarna zum Launch? | Nur Stripe (Karte, Apple Pay, Google Pay) — empfohlen |

### 🟡 3. Inhalte & Daten

**Produkte:** finale Produktliste (Name, Beschreibung, Preis) · Produktfotos (quadratisch 1:1) · Spezifikationen (Maße, Gewicht, Material) · Lagerbestände · SKU-Bestätigung (HSK-2401-850/1200/1400, HSK-LPTG-2501, HSK-LPTB-2501, HSK-CBSB-2601) · produktspezifische Sicherheitshinweise (GPSR)

**Bewertungen:** Die bisherigen „4,8 / 47 Bewertungen" sind rechtlich unzulässig (unklare Quelle) und wurden entfernt. Starten wir nur mit echten Kundenbewertungen? *(empfohlen)*

**Branding:** Teamfotos (Über-uns-Seite) · Logo-Datei für E-Mails (PNG/SVG) · finale Markengeschichte

**E-Mail:** Admin-Benachrichtigungen an `saleshub@niintellect.de` oder separate Adresse?

### 🟢 4. Übergabe (nach dem Launch)

Git-Repository · Hosting-Account · Domain `hausku.com` · Stripe-Konto · E-Mail-Domain — Übertragung auf NI Intellect UG.

Bitte senden Sie uns die drei kritischen Punkte (A–C) noch **dieser Woche**, damit wir den Launch-Termin fixieren können.

Vielen Dank!

*Stand: 19.09.2026 · HAUSKU Development*
