# Client-Pending Checklist (launch blockers & inputs)

Everything below is **pending from the client side**. Items marked 🔴 are needed
**before going live**; 🟡 can ship later.

---

## 🌐 Live Links (after Hostinger deploy)

| Portal | URL |
|---|---|
| **User portal (storefront)** | `https://hausku.com` |
| **Admin portal** | `https://hausku.com/admin` |

## 🔑 Admin credentials

- **Email:** `admin@hausku.com` (from `ADMIN_EMAIL` in `.env`)
- **Password:** value of `ADMIN_PASSWORD` in your local `.env` — and must be set
  again in Hostinger → Environment Variables (the zip excludes `.env`).
  > ⚠️ If `ADMIN_PASSWORD` is ever unset, the app falls back to a weak default —
  > always keep it set.

---

## 🔴 1. Company legal data — for Impressum + invoices + footer

The German **Impressum is legally required** and currently shows placeholders.

| Data | Currently | Where |
|---|---|---|
| Full registered address (street + no.) | `[Straße Nr.]` / `[PLZ Ort]` | `src/app/(storefront)/imprint/page.tsx` |
| Phone number | `[pending]` | same |
| Register entry (e.g. HRB …, Amtsgericht …) | `HRB 123456 Amtsgericht Berlin` (placeholder) | `src/locales/de.json` + `en.json` → `imprint.registerDetails` |
| VAT ID / USt-IdNr. | `DE123456789` (placeholder) | `imprint.taxId` + Admin → Settings (`vatId`) |
| CEO / Geschäftsführer name | `Max Mustermann` (placeholder) | `imprint.ceoName` |

> Same data also feeds the **invoice PDF** (company name, address, phone, VAT ID):
> Admin → Settings (keys `company_name`, `company_address`, `company_phone`, `vat_id`).

## 🔴 2. Contact page — real contact details

| Data | Currently | Where |
|---|---|---|
| Phone | `[Telefonnummer]` | `src/locales/de.json` → `contact.phonePlaceholder` |
| Address | `[Straße Nr., PLZ Ort, Deutschland]` | `contact.addressPlaceholder` |
| Business hours | `Mo–Fr, 9:00–17:00 Uhr` (confirm or change) | `contact.hoursPlaceholder` |

## 🔴 3. Payments — live Stripe keys

Current keys are **test/placeholder**. Before real orders:

- [ ] `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → **live** keys from Stripe dashboard
- [ ] Stripe **webhook**: create endpoint `https://hausku.com/api/payments/stripe/webhook`
      with event `checkout.session.completed` → paste signing secret into `STRIPE_WEBHOOK_SECRET`
- [ ] Decision: **PayPal / Klarna** — currently **not implemented** in code
      (`Payment provider paypal not yet implemented`). If client wants them,
      that's a dev task, not just credentials. 🟡

## 🔴 4. SMTP mailbox — order/contact emails

- [ ] Confirm `info@hausku.com` mailbox exists + provide its password
      → set `SMTP_USER` / `SMTP_PASS` on Hostinger (emails are **silently skipped**
      until then)
- [ ] Optional: dedicated alerts mailbox → `SMTP_ADMIN_ALERT_TO` (defaults to `info@hausku.com`)

## 🟡 5. Google login (optional)

- [ ] Google OAuth `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` + authorized
      redirect URI `https://hausku.com/api/auth/google/callback`
      (until then, customers log in with email/password only)

## 🟡 6. About Us page — real content

| Data | Currently | Where |
|---|---|---|
| Team photos (4 people) | Letter avatars `A/B/C/D` + note "photos pending from client" | `src/app/(storefront)/about/page.tsx` (Team section) |
| Team member names/roles | missing | same |
| Amazon seller link | `https://www.amazon.de/s?me=A1H38T7KVDATDQ` — **verify this seller ID is live** | same page (Amazon CTA) |
| Story / mission text | generic draft — confirm final wording | locale files → `about.*` |

## 🟡 7. Store settings — admin → Einstellungen

Confirm in Admin → Settings (before real orders):

- [ ] `vatRate` (German VAT — usually 19%)
- [ ] `freeShippingThreshold` (currently 30 €) + `shippingFlatRate`
- [ ] company name / address / phone / VAT ID (see #1)

## 🟡 8. Product catalog — final data

- [ ] Confirm the **6 seeded products** (names, prices, images) are the final
      launch catalog — or provide the real product list (name, price, stock,
      images, description DE/EN, category)

## 🟡 9. Coupons / Sale system — decision

- [ ] Coupon/discount system is **not implemented** (`requirements.md`: "not
      started"). Navbar "Sale" link was **renamed to "Neuheiten / New Arrivals"**
      so customers don't expect discounts that don't exist. If the client wants
      real sales/coupons, that's a dev task.

---

## How to hand these over

Collect everything in one place (e.g. a Google Doc) with this structure:

```
1. Company: legal name, address, phone, VAT ID, register entry, CEO name
2. Contact: phone, address, business hours
3. Payments: Stripe live keys + webhook secret (+ decision on PayPal/Klarna)
4. Email: SMTP password for info@hausku.com
5. Google: OAuth credentials (optional)
6. About: team photos + names/roles, Amazon link confirmation
7. Settings: VAT %, shipping threshold + rate
8. Products: final catalog list
9. Coupons: yes/no decision
```

Once provided, tick the items off here and the corresponding code placeholders
can be filled in.
