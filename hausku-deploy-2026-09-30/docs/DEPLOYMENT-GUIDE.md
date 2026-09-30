# 🚀 HAUSKU — Hostinger Deployment Guide (Progress Preview)

> **Maqsad:** Client ko current progress dikhane ke liye website Hostinger pe upload karna.
> Ye guide step-by-step hai — har section me likha hai *kya karna hai*, *kahan karna hai*, aur *kis cheez ka khyal rakhna hai*.
>
> ⚠️ **Ye PREVIEW deploy hai, PRODUCTION launch NAHI.** Stripe keys abhi placeholder hain — checkout me payment fail hoga (expected). Preview ke liye baaki sab (storefront, admin panel, accounts, legal pages, emails) kaam karega.

---

## 0. Zip me kya hai / kya NAHI hai

| Zip me SHAAMIL | Zip se EXCLUDE |
|---|---|
| Poora source code (`src/`, `prisma/`, `public/`) | ❌ `node_modules` (server pe install hoga) |
| `package.json` + `package-lock.json` | ❌ `.next` (build output — server pe build hoga) |
| Config files (`next.config.ts`, `tsconfig.json`, …) | ❌ `.git` folder |
| Docs (`docs/`) + client-pending folder | ❌ `.env` (**secrets — kabhi zip me nahi**) |
| `docs/DEPLOYMENT-GUIDE.md` (ye file) | ❌ `*.zip`, `*.log`, test artifacts |

---

## 1. Hostinger pe kya plan chahiye

Next.js app **Vercel jaisi serverless pe nahi chalti** — isko Node.js process chahiye. Hostinger options:

| Plan | Kaam karega? | Note |
|---|---|---|
| Shared hosting (sirf PHP) | ❌ NAHI | Node app nahi chal sakti |
| **VPS (KVM 1/2)** | ✅ Best | Full control — Node + PM2 + MySQL |
| Cloud hosting | ✅ | Agar Node.js support ho |

**DB:** `u975689130_test` MySQL DB already Hostinger pe hai (`auth-db2071.hstgr.io`) — schema prisma se sync hoga.

---

## 2. Step-by-step deployment (VPS)

### Step 2.1 — Server prepare
```bash
# Node 20 LTS install (agar nahi hai)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # v20.x chahiye

# PM2 (process manager — app ko zinda rakhta hai)
sudo npm i -g pm2
```

### Step 2.2 — Code upload
```bash
# Zip upload karo (hPanel File Manager ya SFTP) phir:
cd /home/hausku
unzip hausku-store-hostinger-2026-09-19.zip -d app
cd app
```

### Step 2.3 — `.env` banao (SABSE IMPORTANT STEP)
```bash
nano .env
```
Neeche **Section 3** me poora template hai — copy karo aur values bharo.

> ⚠️ **KHYAL RAKHNA:**
> - `.env` file **kabhi git me commit ya zip me include nahi karni**
> - `AUTH_SECRET` **zaroor set karo** (warna sessions dev fallback se sign honge — insecure)
> - `ADMIN_EMAIL` / `ADMIN_PASSWORD` preview ke liye bhi strong rakhho (public URL pe admin panel exposed hoga)

### Step 2.4 — Install + DB sync + Build
```bash
npm install                  # dependencies
npx prisma db push           # schema → Hostinger MySQL pe sync
npx prisma db seed           # demo data (Section 4 padho pehle!)
npm run build                # production build (~2-3 min)
```

> ⚠️ **Seed se PEHLE Section 4 zaroor padho** — seed DB ke existing data ko UPSERT karta hai.

### Step 2.5 — App start karo
```bash
pm2 start npm --name hausku -- start
pm2 save
pm2 startup    # server reboot pe auto-start
```

### Step 2.6 — Domain/reverse proxy
Hostinger hPanel me subdomain banao (e.g. `preview.hausku.com`) → Nginx/Apache reverse proxy port 3000 pe:

```nginx
location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
}
```
SSL (Let's Encrypt) bhi hPanel se enable karo — cookies `secure` production me hain.

---

## 3. Environment Variables (`.env` template)

> ⚠️ **Ye values server-specific hain. Preview ke liye bhi inhe sahi bharna zaroori hai.**

```ini
# ── Database (Hostinger remote MySQL) ─────────────────────
# hPanel > Databases > Remote MySQL se details lo.
DATABASE_URL="mysql://USERNAME:PASSWORD@auth-db2071.hstgr.io:3306/DB_NAME"

# ── Security (PREVIEW KE LIYE BHI ZAROORI) ────────────────
# Session cookies HMAC-signed hain. Generate: openssl rand -base64 32
AUTH_SECRET="koi-lamba-random-string-yahan"

# Admin panel login (/admin)
# ⚠️ Default dev creds use MAT karna — preview bhi public hai!
ADMIN_EMAIL="apna-email@hausku.com"
ADMIN_PASSWORD="strong-password-yahan"

# ── App ────────────────────────────────────────────────────
# Preview URL (emails, sitemap, Stripe redirects isko use karte hain)
NEXT_PUBLIC_APP_URL="https://preview.hausku.com"
NEXT_PUBLIC_APP_NAME="HAUSKU"

# ── Stripe (abhi PLACEHOLDER — preview me checkout fail hoga, EXPECTED) ──
STRIPE_SECRET_KEY="sk_test_placeholder"
STRIPE_WEBHOOK_SECRET="whsec_placeholder"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_placeholder"

# ── PayPal / Klarna (fake integrations REMOVED — blank chhod sakte ho) ──
PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""
KLARNA_USERNAME=""
KLARNA_PASSWORD=""

# ── Email SMTP (Hostinger Business Email) ─────────────────
# hPanel > Emails > Email Accounts se mailbox banao (info@hausku.com)
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_SECURE="true"
SMTP_USER="info@hausku.com"
SMTP_PASS="mailbox-password"
SMTP_FROM="info@hausku.com"
SMTP_FROM_NAME="hausku"
SMTP_ADMIN_ALERT_TO="admin@hausku.com"

# ── Google OAuth (optional — "Sign in with Google") ───────
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Variable-by-variable notes

| Variable | Kis cheez ka khyal rakhna hai |
|---|---|
| `DATABASE_URL` | Password me special chars (`@`, `#`) hon to URL-encode karo. Hostinger remote MySQL me apne IP whitelist karna hoga (hPanel > Remote MySQL) |
| `AUTH_SECRET` | **Kabhi change mat karna deploy ke beech** — sab sessions invalidate ho jayenge |
| `ADMIN_EMAIL/PASSWORD` | Ye seed se NAHI aate — sirf env se. Login `/admin` pe |
| `NEXT_PUBLIC_APP_URL` | Trailing slash ke **bina**. Galat ho to emails me ghalat links, Stripe redirect fail |
| `STRIPE_*` | Placeholder = checkout button pe error. Client se test keys aaye to replace |
| `SMTP_*` | Hostinger pe mailbox pehle banao hPanel me, phir wo creds. `SMTP_ADMIN_ALERT_TO` = jahan new-order alert jaye |
| `NEXT_PUBLIC_*` | Build time pe inline hote hain — **inhe badla to dobara `npm run build` karna parega** |

---

## 4. Seed Data — Kya hai, kya karta hai

`npx prisma db seed` ye karta hai:

| Data | Kya seed hota hai | Preview ke liye |
|---|---|---|
| **Categories** | Laptopkissen, Brotdosen, Snack-Organizer etc. | ✅ Chahiye |
| **Products** | 6 demo products, variants (850/1200/1400ml), **real GPSR data** (NI Intellect UG, Hamberge address, USt-IdNr.), German safety warnings | ✅ Chahiye |
| **Store settings** | Shipping €4.99, free shipping €30, VAT 19%, **company data (company_manager: Nazia Iqbal)** — invoices/emails isi se | ✅ Chahiye |
| **Reviews** | ~7 demo reviews | ✅ Chahiye (fake ratings removed, ye marked demo hain) |

### ⚠️ Seed ke baare me important cheezein

1. **Seed UPSERT karta hai** (destroy nahi) — agar DB me pehle se orders/customers hain to wo **safe** rehte hain, sirf products/settings update honge.
2. **Existing products pe naye GPSR fields** (`manufacturerAddress`, `manufacturerEmail`, `productType`) — agar products admin se banaye gaye the aur seed re-run NAHI kiya, to wo fields **khaali** dikhengi. Product page ka GPSR block tab incomplete dikhega. **Solution: `npx prisma db seed` chalao.**
3. **Demo orders/customers seed me NAHI hain** — admin panel me Orders khaali dikhenge (normal hai). Client ko batana: "orders tab aayenge jab real payments live honge".
4. **Admin user DB me nahi banta** — admin login sirf `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars se hota hai.

---

## 5. Deploy ke BAAD verification checklist

- [ ] Homepage khulta hai (`https://preview.hausku.com`) — forest green theme dikhna chahiye
- [ ] Product detail page — GPSR block (manufacturer + address + warnings) complete dikhna chahiye
- [ ] `/imprint`, `/terms`, `/privacy`, `/returns` — legal pages real content ke saath
- [ ] Language switcher DE ⇄ EN dono me kaam kare
- [ ] `/admin` login `ADMIN_EMAIL`/`ADMIN_PASSWORD` se — dashboard, products, orders, settings
- [ ] Account register + login + password reset email (SMTP sahi ho to email aayega)
- [ ] Checkout tak jao — Stripe placeholder hone ki wajah se **payment error EXPECTED hai** — client ko pehle bata dena
- [ ] Contact form submit — admin email pe alert (SMTP configured ho to)

## 6. Client ko preview dikhane se pehle bolo

1. "Ye **progress preview** hai — Stripe keys abhi nahi hain isliye payment fail hoga"
2. Admin credentials alag se bhejo (email me password likhne ke bajaye call/WhatsApp pe)
3. `client-pending/client-request.pdf` ke saath bhejo — 3 critical items yaad dilane ke liye

---

*Generated: 2026-09-19 · HAUSKU Development*
