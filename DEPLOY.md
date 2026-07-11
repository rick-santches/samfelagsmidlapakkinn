# Deploying Zombly

Get Zombly live on Vercel + a managed Postgres in ~20 minutes. No email or
OAuth setup required — the built-in **owner login** gets you in.

## What's already wired for you

- `vercel-build` script runs `prisma generate && prisma migrate deploy &&
  next build` — so **migrations apply automatically on every deploy**.
- `postinstall` regenerates the Prisma client.
- `vercel.json` schedules the weekly-digest cron (Mondays 14:00 UTC).
- Every optional integration (Stripe, Plaid, Resend, Google) degrades
  gracefully when its env vars are absent — nothing crashes.

## Step 1 — Create a Postgres database

Any Postgres 14+ works. Fastest options (free tiers):

- **Neon** (recommended) — <https://neon.tech> → new project → copy the
  connection string (use the **pooled** connection string for serverless).
- **Supabase** — <https://supabase.com> → Project Settings → Database → URI.
- **Vercel Postgres** — add it from the Vercel dashboard; it sets
  `DATABASE_URL` for you.

Keep the connection string — it's your `DATABASE_URL`.

## Step 2 — Import the repo into Vercel

1. <https://vercel.com/new> → import this GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Build command: leave as default — Vercel runs the `vercel-build` script
   automatically, which includes the migration step.
4. Don't deploy yet — set env vars first (Step 3).

## Step 3 — Environment variables (Vercel → Settings → Environment Variables)

**Required (minimum to be live):**

| Variable | Value |
|---|---|
| `DATABASE_URL` | from Step 1 |
| `AUTH_SECRET` | run `openssl rand -base64 32` and paste the output |
| `NEXT_PUBLIC_APP_URL` | your deploy URL, e.g. `https://zombly.vercel.app` |
| `ADMIN_EMAIL` | your email — this is your owner login |
| `ADMIN_PASSWORD` | a long, unique password |

That's enough to deploy and sign in. Everything below is optional.

**Optional — real email (magic links + alert/digest emails):**

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | from <https://resend.com> |
| `EMAIL_FROM` | `Zombly <auth@yourdomain.com>` (domain must be verified in Resend) |

**Optional — Google sign-in:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
(add `https://YOUR_URL/api/auth/callback/google` as an authorized redirect
URI in the Google Cloud console).

**Optional — Stripe billing:** `STRIPE_SECRET_KEY`, then after deploy add a
webhook endpoint at `https://YOUR_URL/api/webhooks/stripe` (events:
`checkout.session.completed`, `customer.subscription.updated`,
`customer.subscription.deleted`) and paste its signing secret into
`STRIPE_WEBHOOK_SECRET`.

**Optional — Plaid bank connections (Team plan):** `PLAID_CLIENT_ID`,
`PLAID_SECRET`, `PLAID_ENV` (`sandbox` to start).

**Optional — weekly digest cron:** `CRON_SECRET` (any random string). Vercel
Cron sends it automatically; without it the cron endpoint 401s harmlessly.

## Step 4 — Deploy

Click **Deploy**. Vercel installs, generates the Prisma client, applies
migrations to your database, and builds. First deploy takes ~2 minutes.

## Step 5 — Sign in and create your org

1. Visit `https://YOUR_URL/signin`.
2. Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set.
3. First sign-in has no organization yet → you'll land on **/welcome** to
   name your company. That creates your org; you're now on the dashboard.
4. Upload a statement CSV (Sources) to see real detection on your own data.

> The production database starts **empty** — no demo "Zombly Demo Co" org.
> That's intentional: your first sign-in creates your real organization.
> (To load the demo fixtures into a staging DB instead, run
> `npm run db:seed` against that database.)

## Custom domain (optional)

Vercel → Project → Settings → Domains → add your domain, follow the DNS
steps, then update `NEXT_PUBLIC_APP_URL` (and any OAuth/Stripe/Plaid
redirect URLs) to the new domain.

## Troubleshooting

- **Can't sign in / "That didn't match":** confirm `ADMIN_EMAIL` and
  `ADMIN_PASSWORD` are set in the environment you deployed (Production), then
  redeploy so the change takes effect.
- **Build fails on the migrate step:** `DATABASE_URL` must be set and
  reachable from Vercel's build. Neon's pooled URL works; if a direct URL is
  required for migrations, set it as `DIRECT_URL` and add
  `directUrl = env("DIRECT_URL")` to the datasource block in
  `prisma/schema.prisma`.
- **Emails not sending:** without `RESEND_API_KEY`, magic-link sign-in and
  alerts are disabled in production by design — use owner login, or add the key.
