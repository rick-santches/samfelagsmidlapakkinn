# Zombly 🧟

**Kill your zombie subscriptions.**

Zombly is a subscription & spend auditing SaaS for US small businesses
(5–50 employees). Upload or connect your business card/bank statements and
Zombly detects every recurring charge, groups them into subscriptions, flags
the waste — duplicates, overlapping tools, zombie charges, price hikes, trial
conversions, looming annual renewals — and hands you a **Kill List** with
estimated annual savings and per-vendor cancellation instructions.

## Stack

- **App**: Next.js 14 (App Router), TypeScript strict, Tailwind CSS
- **DB**: PostgreSQL + Prisma
- **Auth**: Auth.js v5 — email magic link (Resend) + Google OAuth
- **Billing**: Stripe (Checkout + customer portal + webhooks)
- **Email**: Resend (instant alerts + weekly digest)
- **Bank data**: Plaid Transactions — behind a source-adapter interface, so
  CSV import works identically without Plaid
- **Charts**: recharts · **Tests**: Vitest (85 tests)

## Architecture in one paragraph

Every ingestion path — CSV upload, Plaid sync, (soon) email receipts —
produces the same `NormalizedTransaction` shape (`src/lib/sources/types.ts`).
Transactions are hashed (`sha256(orgId+date+amount+rawDescription)`) with a
unique `(orgId, hash)` index, so re-imports are idempotent by construction.
The detection engine (`src/lib/engine/`, pure TypeScript, zero framework
deps) normalizes merchant descriptors against a curated ~300-merchant
dictionary, clusters charges into subscriptions with cadence + confidence,
and runs six flag rules. `src/lib/pipeline.ts` reconciles engine output into
the database without ever resurrecting a flag the user dismissed. Every
org-scoped query goes through `orgDb(orgId)` (`src/lib/db.ts`), a Prisma
extension that force-injects the `orgId` filter on reads *and* writes.

## Local setup

```bash
# 1. Install
npm install

# 2. Database (Docker)
docker compose up -d
# ...or point DATABASE_URL at any Postgres 14+

# 3. Environment
cp .env.example .env
# minimum for local dev: DATABASE_URL + AUTH_SECRET (openssl rand -base64 32)

# 4. Migrate + seed the demo org
npx prisma migrate dev
npx prisma db seed

# 5. Run
npm run dev
```

Sign in with **any email address** — without `RESEND_API_KEY` the magic link
is printed to the server console instead of sent. The seeded demo account is
`demo@zombly.com` (Team plan, 18 months of data, every flag type present:
one duplicate Dropbox pair, Zoom+Meet and Notion+Confluence overlaps, two
zombies, an Adobe price hike, a HubSpot trial conversion, and a Squarespace
annual renewal ~3 weeks out).

```bash
npm test              # engine + CSV + crypto + email suites (hermetic, no DB)
npm run test:integration  # tenant-isolation checks against a live Postgres
npm run typecheck     # tsc --noEmit, strict
npm run build         # production build
```

The integration suite proves the core multi-tenant invariant: `orgDb(orgId)`
never lets one org read, update, or delete another org's rows (see
`src/lib/db.ts`). It needs `DATABASE_URL` and is kept out of the default
`npm test` so unit runs stay hermetic.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `AUTH_SECRET` | yes | Auth.js JWT + token-encryption key (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | yes | Absolute app URL (links in emails, Stripe redirects) |
| `RESEND_API_KEY` | no | Sends magic links + alerts; console fallback in dev, disabled in prod if unset |
| `EMAIL_FROM` | no | From header, e.g. `Zombly <auth@yourdomain.com>` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | Enables "Continue with Google" |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | no | Enables built-in owner email+password login (email-free way into any deploy) |
| `STRIPE_SECRET_KEY` | no | Enables checkout + billing portal |
| `STRIPE_WEBHOOK_SECRET` | no | Verifies `/api/webhooks/stripe` |
| `PLAID_CLIENT_ID` / `PLAID_SECRET` / `PLAID_ENV` | no | Enables bank connections (Team plan) |
| `CRON_SECRET` | no | Bearer token for `/api/cron/weekly-digest` |

Everything optional degrades gracefully — the relevant UI explains what to
set instead of crashing.

## Plaid sandbox

1. Create a free account at <https://dashboard.plaid.com> → get sandbox
   `client_id` and `secret`.
2. `.env`: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV="sandbox"`.
3. The org must be on the **Team** plan (seed org already is; or update
   `Organization.plan` manually).
4. Sources → **Connect a bank with Plaid** → pick any institution →
   credentials `user_good` / `pass_good`.
5. Up to 18 months of sandbox transactions import through the same pipeline
   as CSV; **Sync now** pulls increments via `transactionsSync` cursors.

Access tokens are AES-256-GCM encrypted at rest (`src/lib/crypto.ts`);
raw transaction descriptions are never logged.

## Stripe

Checkout uses inline `price_data`, so **no dashboard products are needed** —
any Stripe account works immediately. Plans: Solo $19/mo, Team $49/mo,
annual = 2 months free. For webhooks in dev:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# put the printed whsec_... into STRIPE_WEBHOOK_SECRET
```

`checkout.session.completed` and `customer.subscription.updated/deleted`
update `Organization.plan`; limits (sources, flags, Plaid) are enforced
server-side in the API routes, not just hidden in the UI.

## Deployment (Vercel)

1. Push, import the repo in Vercel, set the env vars above.
2. Postgres: Vercel Postgres / Neon / Supabase — set `DATABASE_URL`.
3. `vercel.json` already schedules the weekly digest cron (Mon 14:00 UTC);
   set `CRON_SECRET` and Vercel sends it automatically.
4. Stripe webhook endpoint: `https://your-domain/api/webhooks/stripe`.
5. Run migrations on deploy: `npx prisma migrate deploy` (build hook or CI).

## Project map

```
prisma/                 schema, migrations, fixtures + seed (runs the real engine)
src/lib/engine/         detection: merchants, normalize, recurrence, flags (pure TS)
src/lib/sources/        adapters: csv (6 bank formats), plaid (transactionsSync)
src/lib/pipeline.ts     engine output → DB reconciliation → AuditReport
src/lib/db.ts           orgDb() — org-scoping enforced at the Prisma layer
src/app/dashboard/      money screen, subscriptions, review deck, kill list,
                        sources, settings (billing + alert prefs)
src/app/api/            csv import, plaid, billing, stripe webhook, digest cron,
                        kill-list export
```
