# hausku-store — Hostinger Deployment Package

This folder is ready to upload to your Hostinger Business hosting account.

## What's inside

- Full Next.js 16 source code (`src/`, `public/`)
- Prisma schema + seed (`prisma/`)
- Production `.env` pre-configured with your Hostinger MySQL database:
  - DB: `u975689130_hausku`
  - User: `u975689130_hausku_user`
  - Host: `localhost:3306` (Hostinger MySQL is local to the hosting account)
- `DEPLOY-README.md` (this file)

> ⚠️ **Do NOT upload** `node_modules/` or `.next/` — they are excluded. Install
> dependencies on the server instead.

## Requirements on Hostinger

- **Node.js 20.9+ / 22+** — set this in Hostinger's Node.js manager
  (Next.js 16 requires it).
- **MySQL database** — create `u975689130_hausku` in hPanel if it doesn't
  already exist (the credentials are already in `.env`).
- **SSL** — enable Hostinger's free Let's Encrypt SSL for your domain in hPanel
  before going live.

## Upload steps

1. **Upload** the contents of this folder to Hostinger (e.g. via File Manager
   or FTP into the `nodejsapp/` directory for your Node.js project).
2. **Install dependencies** on the server (SSH):
   ```bash
   cd nodejsapp
   npm install
   ```
3. **Set up the database ONCE** (creates tables + inserts the sample data):
   ```bash
   npm run db:setup
   ```
   > This runs `prisma db push` + `prisma db seed`. Do this **only once**, on
   > the first deploy — never on every rebuild, so production data is safe.
4. **Run the build** (production-safe: `prisma generate` + `next build` only,
   no db push/seed):
   ```bash
   npm run build
   ```
5. **Start the app**:
   ```bash
   npm start
   ```
   Or configure Hostinger's Node.js app settings to run `npm start`
   (check how Hostinger/Passenger routes to the app; `next start` defaults to
   port 3000).

## Admin panel

- Login: **admin@hausku.de** (or whatever you set in `ADMIN_EMAIL`)
- Password: set a strong value in `ADMIN_PASSWORD` in `.env` — the app
  falls back to `hausku-admin-2024` if unset, so **do change it**.

## Important notes

- **MySQL auth plugin check (important):** Prisma only supports
  `mysql_native_password` and `caching_sha2_password` — **not**
  `sha256_password`. If the build/start on the server fails with
  `Unknown authentication plugin 'sha256_password'`, ask Hostinger support
  to run:
  ```sql
  ALTER USER 'u975689130_hausku_user'@'localhost'
  IDENTIFIED WITH caching_sha2_password BY '<your-db-password>';
  ```
  (use the password from your `.env` file)
- The build script intentionally does **not** run `prisma db push`/`db seed` —
  those are dev tools that could overwrite real production data if run on
  every deploy. Run `npm run db:setup` once manually instead.
- The seed adds sample products (6 products, 3 categories, settings). If you
  want **empty production data**, skip `npm run db:setup` and push the schema
  only (`npx prisma db push`).
- **Stripe / PayPal / Klarna** keys are placeholders — replace them in `.env`
  with your live keys before going live. Also register the Stripe webhook
  `/api/payments/stripe/webhook` in the Stripe dashboard with your live domain.
- **Set `NEXT_PUBLIC_APP_URL` to your real domain before building** — it is
  inlined into the bundle at build time and used for absolute links and
  Stripe redirects.

## Verify after deploy

- Open your domain → homepage should show the hausku products.
- Admin panel: `/admin` → log in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- `/.env` must be present on the server — never commit it to git.
