# hausku — E-Commerce Web Application

German-market online store for NI Intellect UG (brand: **hausku**). Household & kitchen products (laptop cushions, lunch boxes, snack organizers, etc.).

Built with **Next.js (App Router) + Prisma + MySQL**, deployed to the client's **Hostinger Business** hosting.

## Tech Stack
- **Framework:** Next.js (App Router, React Server Components)
- **Database:** MySQL via Prisma ORM
- **Auth:** session cookies + bcryptjs (customer + single admin user)
- **Payments:** Stripe (integrated) · PayPal · Klarna (planned)
- **i18n:** DE (default) / EN locale files + LanguageSwitcher
- **Styling:** Tailwind CSS (brand: lime green `#32CD32`)

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database (local or Hostinger)
- Stripe account (for payments)

### Setup
```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT/session secret, Stripe keys
npx prisma db push     # or: npx prisma migrate dev
npx prisma db seed     # 8 sample products, 3 categories, settings
npm run dev            # http://localhost:3000
```

### Scripts
```bash
npm run dev        # development server
npm run build      # production build
npm run start      # start production server
npx prisma studio  # database UI
```

### Key directories
- `src/app/(storefront)/` — customer-facing pages (home, catalog, product, cart, checkout, account, legal)
- `src/app/admin/` — admin panel (dashboard, products, orders, customers, settings)
- `src/app/api/` — REST API routes (products, orders, auth, payments, invoices, admin)
- `src/components/` — shared + storefront + admin components
- `src/lib/` — core logic (auth, cart, payments, vat, invoices, db)
- `src/locales/` — DE/EN translation files
- `prisma/schema.prisma` — database schema

## Project Status
See [memory.md](./docs/memory.md) (status log), [phases.md](./docs/phases.md) (phase progress), [requirements.md](./docs/requirements.md) (feature checklist).

## Deployment
Deployment to Hostinger is documented in [DEPLOY-README.md](./DEPLOY-README.md).
