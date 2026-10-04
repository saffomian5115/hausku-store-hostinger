# HAUSKU — Local Testing Data Guide (MySQL)

Ye guide aap ke local MySQL database ke liye hai. Isme har table ka purpose, konsi columns
required hain, aur kaunsa data insert karne se app ka konsa feature test hoga — sab kuch hai.
Seed data ki zaroorat nahi, aap neeche diye examples se apna khud ka test data bana sakte hain.

---

## 0. Setup jo already ho chuka hai

- `.env` me database ab local MySQL pe point karta hai:

  ```
  DATABASE_URL="mysql://root:1256@localhost:3306/hausku"
  ```

  (Backup `.env.bak` me rakha hua hai.)
- Saare 14 tables `prisma db push` se ban chuke hain:
  `categories, products, product_variants, customers, addresses, orders, order_items,
  invoices, credit_notes, return_requests, reviews, settings, wishlist_items, coupons`

Tables dubara verify karne ke liye:

```bash
mysql -uroot -p1256 hausku -e "SHOW TABLES;"
```

Prisma Studio (GUI, sabse aasan data entry):

```bash
npm run db:studio
```

Server chalane ke liye:

```bash
npm run dev        # http://localhost:3000
```

> **Column names** schema ki tarah `camelCase` hain (`basePrice`, `categoryId`, ...) — SQL me
> backticks (`) laga kar likhein. Table names `snake_case` plural hain.

---

## 1. INSERT ORDER (Foreign Keys zaroori)

App ko break hone se bachane ke liye isi tarteeb se data daalein:

1. `categories`
2. `products`
3. `product_variants`
4. `customers`
5. `addresses`
6. `orders` + `order_items`
7. `invoices` / `credit_notes`
8. `reviews` / `wishlist_items` / `return_requests`
9. `settings`

---

## 2. Table-wise data aur test mapping

### 2.1 `categories` — product categories

| Column | Required | Notes |
| --- | --- | --- |
| `name` | ✅ | Display name |
| `slug` | ✅ | Unique, URL me use hota (`/catalog?category=slug`) |
| `sortOrder` | ✅ (default 0) | Catalog order |

```sql
INSERT INTO categories (name, slug, sortOrder) VALUES
  ('Küche',    'kueche',    1),
  ('Haushalt', 'haushalt',  2);
```

**Test:** Homepage categories, `/catalog` filtering, navbar links.

---

### 2.2 `products` — catalog

| Column | Required | Notes |
| --- | --- | --- |
| `name` | ✅ | Product title |
| `slug` | ✅ | Unique, `/product/<slug>` URL |
| `basePrice` | ✅ | Float (EUR) |
| `categoryId` | ✅ | FK → `categories.id` (category pehle banao) |
| `description` | ⬜ | Product page text |
| `imageUrl` | ⬜ | e.g. `/images/products/x.jpg` |
| `active` | default 1 | 0 = storefront pe hidden |
| `featured` | default 0 | 1 = homepage featured |
| `manufacturer`, `manufacturerAddress`, `manufacturerEmail`, `productType`, `safetyWarnings` | ⬜ | GPSR fields product page pe dikhte hain. `safetyWarnings` me har warning new line (`\n`) se |

```sql
INSERT INTO products
  (name, slug, description, basePrice, imageUrl, categoryId, active, featured,
   manufacturer, manufacturerAddress, manufacturerEmail, productType, safetyWarnings)
VALUES
  ('Test Laptopkissen Grau', 'test-laptopkissen-grau',
   'Ergonomisches Lapdesk für Bett und Sofa.',
   29.90, '/images/products/laptopkissen-grau.jpg', 2, 1, 1,
   'NI Intellect UG', 'Roggenring 26, 23619 Hamberge', 'saleshub@niintellect.de',
   'Laptopkissen', 'Nicht als Sitzmöbel verwenden.\nVon Feuer fernhalten.'),
  ('Test Brotdose 850 ml', 'test-brotdose-850',
   'Auslaufsichere Edelstahl-Brotdose.',
   11.95, '/images/products/brotdose-850ml.jpg', 1, 1, 0,
   'NI Intellect UG', 'Roggenring 26, 23619 Hamberge', 'saleshub@niintellect.de',
   'Edelstahl-Brotdose', 'Nicht für Mikrowelle geeignet.');
```

**Test:** Homepage featured grid, `/catalog`, search (typo-tolerant search bhi test karein,
e.g. "brotdose"/"laptp"), product detail `/product/<slug>`, GPSR section, inactive product
storefront se hide.

---

### 2.3 `product_variants` — SKU, stock, price override

**Checkout ke liye ye zaroori hai** — order sirf variant se banta hai (product + `variantId`).
`productId` FK, aur `sku` unique.

| Column | Required | Notes |
| --- | --- | --- |
| `productId` | ✅ | FK → `products.id` |
| `sku` | ✅ | Unique |
| `stockQty` | ✅ (default 0) | 0 = out of stock; checkout block hota hai |
| `size`, `color`, `colorHex` | ⬜ | Variant label me `size / color` ban ke aata hai |
| `priceOverride` | ⬜ | NULL ho to `products.basePrice` use hoti hai |
| `active` | default 1 | 0 = checkout me available nahi |

```sql
INSERT INTO product_variants (productId, size, color, colorHex, sku, stockQty, priceOverride, active) VALUES
  (1, NULL,    'Grau',    '#808080', 'HSK-LK-GRY-001',   20, NULL,  1),
  (2, '850 ml','Silber',  '#C0C0C0', 'HSK-LB-850-SLV',   0,  NULL,  1),   -- out-of-stock test
  (2, '1200 ml','Silber', '#C0C0C0', 'HSK-LB-1200-SLV',  35, 12.50, 1);   -- price override test
```

**Test:** Product page variant selector, stock validation message, `priceOverride` price,
out-of-stock "nicht verfügbar".

---

### 2.4 `customers` — customer accounts

| Column | Required | Notes |
| --- | --- | --- |
| `email` | ✅ | Unique, lowercase |
| `password` | ⬜ | **bcrypt hash**. NULL ho to login nahi ho sakta (guest) |
| `name`, `phone` | ⬜ | |
| `isGuest` | default 0 | 1 = guest (password ke bina) |
| `resetToken`, `resetExpiry` | ⬜ | Password reset flow test ke liye |

**Password ka bcrypt hash banane ka tareeqa** (bcryptjs project me installed hai):

```bash
node -e "console.log(require('bcryptjs').hashSync('Test@1234', 12))"
```

Output (jaise `$2a$12$....`) ko `password` column me daalein. Phir us email/password se
`/login` pe login karein.

```sql
-- Registered customer (login test ke liye; hash upar wale command se aaye)
INSERT INTO customers (email, name, phone, password, isGuest) VALUES
  ('test.customer@example.com', 'Test Kunde', '+4915112345678',
   '$2a$12$REPLACE_WITH_GENERATED_HASH', 0);

-- Guest customer (login nahi, mostly order ke sath associate)
INSERT INTO customers (email, name, isGuest) VALUES
  ('guest@example.com', 'Guest Kunde', 1);
```

**Test:** `/register`, `/login`, `/account`, `/forgot-password` + `/reset-password`
(`resetToken` insert kar ke test kiya ja sakta hai).

---

### 2.5 `addresses` — customer addresses

`customerId` FK required. `label` default `default`, `country` default `DE`.

```sql
INSERT INTO addresses
  (customerId, label, firstName, lastName, street, street2, city, state, postalCode, country, isDefault)
VALUES
  (1, 'Home', 'Test', 'Kunde', 'Musterstraße 12', NULL, 'Hamburg', NULL, '20095', 'DE', 1),
  (1, 'Work', 'Test', 'Kunde', 'Büroweg 3', 'Etage 2', 'Hamburg', NULL, '20095', 'DE', 0);
```

**Test:** `/account/addresses` add/edit/delete/set-default, checkout me address selection.

---

### 2.6 `orders` + `order_items`

**Order statuses** (admin state machine, `src/app/api/admin/orders/[id]/route.ts`):

`PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`
Side branches: `CANCELLED`, `RETURNED`, `REFUNDED`.

**`orders` required columns:** `orderNumber` (unique), `status`, `subtotal`, `vatRate`,
`vatAmount`, `total`. Baaki optional (`guestEmail`/`guestName` guest orders ke liye,
`customerId` registered customer ke liye, shipping fields).

```sql
INSERT INTO orders
  (orderNumber, customerId, status, subtotal, shippingCost, vatRate, vatAmount, total,
   currency, guestEmail, guestName, paymentMethod, paymentId, paidAt, locale,
   shippingName, shippingStreet, shippingCity, shippingPostal, shippingCountry,
   trackingNumber, trackingCarrier, createdAt)
VALUES
  ('hausku-test-0001', 1, 'DELIVERED', 24.95, 0.00, 19, 4.74, 29.69,
   'EUR', 'test.customer@example.com', 'Test Kunde', 'stripe', 'pi_test_0001', NOW(), 'de',
   'Test Kunde', 'Musterstraße 12', 'Hamburg', '20095', 'DE',
   'TRACK123456', 'DHL', NOW() - INTERVAL 5 DAY),
  ('hausku-test-0002', NULL, 'PENDING', 11.95, 4.99, 19, 2.27, 19.21,
   'EUR', 'guest@example.com', 'Guest Kunde', 'stripe', NULL, NULL, 'de',
   'Guest Kunde', 'Example 1', 'Berlin', '10115', 'DE',
   NULL, NULL, NOW()),
  ('hausku-test-0003', 1, 'SHIPPED', 29.90, 0.00, 19, 5.68, 35.58,
   'EUR', 'test.customer@example.com', 'Test Kunde', 'stripe', 'pi_test_0003', NOW(), 'de',
   'Test Kunde', 'Musterstraße 12', 'Hamburg', '20095', 'DE',
   'TRACK999', 'DPD', NOW() - INTERVAL 2 DAY);
```

`order_items` (`orderId` + `productId` FK, `variantId` FK optional):

```sql
INSERT INTO order_items
  (orderId, productId, variantId, productName, variantLabel, qty, unitPrice)
VALUES
  (1, 2, 2, 'Test Brotdose 850 ml', '850 ml / Silber', 1, 11.95),
  (1, 2, 3, 'Test Brotdose 1200 ml', '1200 ml / Silber', 1, 12.50),
  (2, 2, 2, 'Test Brotdose 850 ml', '850 ml / Silber', 1, 11.95),
  (3, 1, 1, 'Test Laptopkissen Grau', 'Grau', 1, 29.90);
```

**Note:** Asli checkout (`POST /api/orders`) status `PENDING` banata hai aur sirf `stripe`
payment method accept karta hai. `paidAt` set hone par admin me "paid" dikhta hai.

**Test:** `/order-lookup` (guest order number + email se), `/account/orders`, admin
`/admin/orders` list + detail, status transitions, tracking number, invoice/credit-note.

---

### 2.7 `invoices` — invoice record (PDF download)

`orderId` unique FK, `invoiceNumber` unique.

```sql
INSERT INTO invoices (orderId, invoiceNumber, pdfPath) VALUES
  (1, 'RE-2026-0001', NULL);
```

**Test:** `/account/orders` se invoice download, admin order detail se invoice download
(`/api/admin/invoices/[id]/download`). `pdfPath` NULL ho to PDF on-the-fly generate hota hai.

---

### 2.8 `credit_notes` — credit note (refund)

`orderId` FK, `creditNoteNumber` unique, `amount` required.

```sql
INSERT INTO credit_notes (orderId, creditNoteNumber, amount, reason) VALUES
  (1, 'GS-2026-0001', 11.95, 'Teilweise Rücksendung — Brotdose beschädigt.');
```

**Test:** `/account/orders` credit note download, admin credit-note download.

---

### 2.9 `return_requests` — Retoure / Widerruf

Eligibility: order ka status **`DELIVERED`** hona chahiye aur us order pe koi active return
(`PENDING`/`APPROVED`/`RECEIVED`) na ho.

**Statuses:** `PENDING → APPROVED | REJECTED → RECEIVED → REFUNDED`

`items` column JSON **text** hai (string), e.g.
`[{"productName":"Test Brotdose 850 ml","variantLabel":"850 ml / Silber","qty":1}]`

```sql
INSERT INTO return_requests
  (returnNumber, orderId, customerId, status, reason, items)
VALUES
  ('RET-2026-0001', 1, 1, 'PENDING',
   'Artikel gefällt nicht.',
   '[{"productName":"Test Brotdose 850 ml","variantLabel":"850 ml / Silber","qty":1}]');
```

**Test:** `/account/orders` → Retoure anfordern, `/admin/returns` list + approve/reject/received/refund,
return-status email.

---

### 2.10 `reviews` — product reviews

`customerId` + `productId` FK, `rating` 1–5. Unique pair `(customerId, productId)`.
`approved=1` ho to product page pe live; `approved=0` admin moderation me.

```sql
INSERT INTO reviews (productId, customerId, rating, title, body, approved, rejected) VALUES
  (1, 1, 5, 'Super Qualität', 'Sehr bequem und stabil.', 1, 0),
  (2, 1, 4, 'Gute Box',       'Auslaufsicher, leicht zu reinigen.', 0, 0);
```

**Test:** Product page review list (sirf approved), reviewed product pe submit form ka
one-review-per-customer block, `/admin/reviews` approve/reject.

---

### 2.11 `wishlist_items` — Wishlist / Liked

Unique pair `(customerId, productId)`.

```sql
INSERT INTO wishlist_items (customerId, productId) VALUES (1, 1), (1, 2);
```

**Test:** Product page heart toggle, `/wishlist` page, login ke bina toggle (login prompt).

---

### 2.12 `settings` — store settings (key/value)

App in keys ko padhta hai (`src/lib/settings/index.ts`). Row na ho to `DEFAULTS` use hoti hain.

```sql
INSERT INTO settings (`key`, `value`) VALUES
  ('vat_rate',              '19'),
  ('vat_id',                'DE367665227'),
  ('free_shipping_threshold','30'),
  ('shipping_flat_rate',    '4.99'),
  ('shop_name',             'hausku'),
  ('default_language',      'de'),
  ('shop_description',      'Nachhaltige Haushaltsprodukte.'),
  ('company_name',          'NI Intellect UG (haftungsbeschränkt)'),
  ('company_email',         'saleshub@niintellect.de'),
  ('company_phone',         '+49 176 45972009'),
  ('company_address',       'Roggenring 26, 23619 Hamberge, Deutschland'),
  ('company_manager',       'Nazia Iqbal');
```

**Test:** Checkout me VAT/versand calculation, free-shipping threshold, invoice/Impressum data,
`/admin/settings` save.

---

### 2.13 `coupons` — (schema me hai, par app abhi use nahi karta)

App ke code me coupon ka koi reference nahi mila — checkout coupon accept nahi karta.
Future feature test ke liye row insert kar sakte hain:

```sql
INSERT INTO coupons (code, discountPercent, discountAmount, minOrderAmount, maxUses, usedCount, active, expiresAt)
VALUES ('WELCOME10', 10, NULL, 20.00, 100, 0, 1, DATE_ADD(NOW(), INTERVAL 30 DAY));
```

---

## 3. Admin panel login

Credentials `.env` se aate hain (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

- URL: `http://localhost:3000/admin/login`
- `.env` me `ADMIN_EMAIL` dekhein aur password wahi use karein jo set hai.
- Agar 2FA (`admin2fa`) armed ho to TOTP code bhi chahiye hoga.

**Test:** `/admin` dashboard (revenue chart orders se banta hai), products CRUD, orders,
customers, returns, reviews, settings.

---

## 4. Full-app testing checklist (end-to-end order)

1. **Catalog:** 2 categories + 2-3 products + variants insert karein → `/` aur `/catalog`.
2. **Search:** "brotdose", "laptp", "kuchen" (typo/diacritic) search karein.
3. **Customer:** `/register` se account banayein (ya bcrypt hash se insert), `/login`.
4. **Address:** `/account/addresses` me address add karein.
5. **Wishlist:** product pe heart → `/wishlist`.
6. **Cart + Checkout:** variant add to cart → `/checkout` → `PENDING` order bane.
   (Stripe test mode me test card `4242424242424242`, ya seedha DB se order insert kar ke aage test karein.)
7. **Order lookup:** `/order-lookup` pe order number + email.
8. **Account orders:** `/account/orders` me order, invoice, credit note, retoure.
9. **Returns:** DELIVERED order pe retoure → `/admin/returns` handle karein.
10. **Reviews:** DELIVERED/product page se review submit → `/admin/reviews` approve.
11. **Admin:** `/admin/orders` me status badlein, tracking add karein, invoice download.
12. **Settings:** `/admin/settings` save → checkout VAT/shipping change verify karein.
13. **Legal pages:** `/imprint`, `/privacy`, `/terms`, `/returns` — `settings` company data se.

---

## 5. Useful commands

```bash
# Tables dekhein
mysql -uroot -p1256 hausku -e "SHOW TABLES;"

# Kisi table ka data
mysql -uroot -p1256 hausku -e "SELECT * FROM products;"

# Prisma GUI
npm run db:studio

# Schema ke mutabiq tables refresh (data wipe warning: --force ke bina safe)
npm run db:push

# Sirf apna test data hata kar fresh start (destructive — sirf test DB pe!)
mysql -uroot -p1256 hausku -e "
  SET FOREIGN_KEY_CHECKS=0;
  TRUNCATE order_items; TRUNCATE orders; TRUNCATE invoices; TRUNCATE credit_notes;
  TRUNCATE return_requests; TRUNCATE reviews; TRUNCATE wishlist_items;
  TRUNCATE addresses; TRUNCATE customers; TRUNCATE product_variants;
  TRUNCATE products; TRUNCATE categories; TRUNCATE settings; TRUNCATE coupons;
  SET FOREIGN_KEY_CHECKS=1;"
```

---

## 6. Notes / gotchas

- `password` me **hamesha bcrypt hash** daalein, plain text nahi — warna login fail hoga.
- `orders.locale` `'de'` ya `'en'` — transactional emails ki language isi se decide hoti hai.
- `order_items.variantId` NULL ho sakta hai, lekin checkout se banne wale orders me hamesha set hota hai.
- `reviews` pe unique `(customerId, productId)` — same customer ek product ko dobara review nahi kar sakta.
- `settings` keys app ke `SETTING_KEYS` se match honi chahiye, warna ignored rahengi.
- `coupons` table app me wired nahi hai (sirf schema-level).
