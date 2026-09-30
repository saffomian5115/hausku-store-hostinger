# 🚀 Plan B — Local Prebuilt Deploy (Hostinger)

> **Idea:** Heavy build local machine pe karo, server pe sirf artifacts upload + lightweight install.
> Server pe `next build` nahi chalega — sirf `npm ci` (deps) + `npm start`.
>
> ⚠️ **`node_modules` kabhi Windows se upload mat karo** — Linux server pe Prisma/SWC binaries crash honge.
> Server pe `npm ci --omit=dev` se install honge (30–60 sec, light).

---

## Step 1 — Local build ke liye env set karo (Windows, project root)

`NEXT_PUBLIC_*` variables **build time pe inline** hote hain — isliye build se PEHLE final URL set karo.

`.env` me (sirf build ke waqt ke liye):

```ini
NEXT_PUBLIC_APP_URL="https://hausku.com"     # ya preview.hausku.com — jo bhi public URL hoga
```

> 📝 Build ke baad apni local dev value (`http://localhost:3000`) wapas laga dena.

## Step 2 — Local build

```powershell
npm run build
```

✅ `.next/` folder ban jayega. (Build local DB bhi use kar sakta hai prerendering ke liye — Hostinger DB already whitelisted hai.)

## Step 3 — DB setup LOCAL se karo (server pe zero load)

Local `.env` ka `DATABASE_URL` Hostinger remote MySQL pe hi point karta hai — to schema/seed **local machine se** chalao:

```powershell
npx prisma db push      # schema sync
npx prisma db seed      # demo data (GPSR, settings, products)
```

## Step 4 — Prebuilt package banao

PowerShell (project root):

```powershell
$stage = ".deploy-stage/hausku"
Remove-Item -Recurse -Force .deploy-stage -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $stage | Out-Null

Copy-Item -Recurse .next "$stage/.next"
Remove-Item -Recurse -Force "$stage/.next/cache"     # build cache — 100+ MB, zaroori nahi
Copy-Item -Recurse public "$stage/public"
Copy-Item package.json, package-lock.json, next.config.ts, prisma.config.ts $stage/
Copy-Item -Recurse prisma $stage/prisma              # schema (future db push ke liye)

Compress-Archive -Path ".deploy-stage/hausku/*" -DestinationPath "hausku-prebuilt.zip" -Force
Remove-Item -Recurse -Force .deploy-stage
```

**Package me kya hai:** `.next` (compiled app), `public`, `package.json` + lockfile, `next.config.ts`, `prisma/`.
**Kya NAHI:** `node_modules` (server pe install), `.env` (server pe banao), `src/` (compiled already).

## Step 5 — Server pe upload + setup (SSH/hPanel Terminal)

```bash
mkdir -p ~/apps/hausku && cd ~/apps/hausku

# zip upload karo (File Manager / SFTP se ~/ path pe) phir:
unzip ~/hausku-prebuilt.zip

# Permissions fix (EACCES error isliye aaya tha):
find . -type d -exec chmod 755 {} +
find . -type f -exec chmod 644 {} +
```

### `.env` banao (DEPLOYMENT-GUIDE.md Section 3 ka template)

```bash
nano .env
```

⚠️ Zaroori: `AUTH_SECRET` set karo (`openssl rand -base64 32`), strong `ADMIN_PASSWORD`, `DATABASE_URL` = Hostinger MySQL, `NEXT_PUBLIC_APP_URL` = **wahi URL jo build ke waqt use kiya**.

### Dependencies install (Linux wale — light, no build)

```bash
npm ci --omit=dev          # ~30-60 sec, sirf runtime deps
npx prisma generate        # Linux Prisma client (Windows wala overwrite hoga)
```

### Test run

```bash
npm start                  # ya: PORT=3000 npm start
# Ctrl+C to stop
```

## Step 6 — Permanent start

**hPanel Node.js app use kar rahe ho to:** Application root = `apps/hausku`, Node 20, startup command = `npm start` → Restart.

**Ya VPS/PM2:**

```bash
pm2 start npm --name hausku -- start
pm2 save && pm2 startup
```

## Step 7 — Verify

- [ ] Homepage load (forest green theme)
- [ ] Product page — GPSR block complete
- [ ] `/imprint`, `/terms`, `/privacy`, `/returns`
- [ ] DE ⇄ EN switch
- [ ] `/admin` login (ADMIN_EMAIL / ADMIN_PASSWORD)
- [ ] Checkout = payment error **expected** (Stripe placeholders)

---

## 🔧 Troubleshooting

| Error | Fix |
|---|---|
| `EACCES permission denied` | `find . -type d -exec chmod 755 {} + && find . -type f -exec chmod 644 {} +` |
| `Query engine library for current platform could not be found` | Windows `node_modules` upload hue — `rm -rf node_modules && npm ci --omit=dev && npx prisma generate` |
| `Cannot find module '@prisma/client'` | `npx prisma generate` re-run |
| 502 / site down | `pm2 logs hausku` dekho; port mismatch — Hostinger app `PORT` env inject karta hai, `next start` use respect karta hai |
| Emails/links galat URL | `NEXT_PUBLIC_APP_URL` build ke waqt galat tha — sahi URL se **dobara local build + re-upload** |
| DB connection fail | hPanel → Remote MySQL → apna server IP whitelist |
