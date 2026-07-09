# Samfélagsmiðlapakkinn – Landing Page

Single-page landing site for **Samfélagsmiðlapakkinn**, a 90-day Icelandic
social media content pack for small local businesses. Built with **Vite +
React + Tailwind CSS**.

> **Demo site:** the [`pontana/`](pontana/) directory contains **Pontana**,
> a standalone Next.js 14 demo restaurant site (flagship demo for the
> "Local Business Starter" package). It has its own README with run,
> deploy and re-skin instructions.

## Before you launch

1. **Checkout link** — open `src/App.jsx` and replace the placeholder
   checkout URL at the top of the file:

   ```js
   const CHECKOUT_URL = 'https://CHANGE-ME.lemonsqueezy.com/checkout'
   ```

   with your real Lemon Squeezy (or other) checkout link.

2. **Contact email / footer** — update the email address and company
   details in the `Footer` component near the bottom of `src/App.jsx`.

3. **OG image** *(optional but recommended)* — drop a `1200x630` image at
   `public/og-image.png` so social shares get a preview image. The tag is
   already wired up in `index.html`.

4. **Domain / canonical URL** — update the `canonical`, `og:url`, and image
   URLs in `index.html` once you know the final domain.

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Build

```bash
npm run build
```

Outputs a static site to `dist/`. Preview it locally with:

```bash
npm run preview
```

---

## Deploy for free — Cloudflare Pages

**Option A: via GitHub (recommended, auto-deploys on push)**

1. Push this repo to GitHub.
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers &
   Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select this repository.
4. Set the build configuration:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**. Cloudflare will build and give you a
   `*.pages.dev` URL immediately. Every future push to `main` redeploys
   automatically.
6. To use your own domain: Pages project → **Custom domains** → add your
   domain and follow the DNS instructions.

**Option B: via CLI (no GitHub needed)**

```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist --project-name samfelagsmidlapakkinn
```

Follow the prompts to log in and create the project on first run.

---

## Deploy for free — Vercel

**Option A: via GitHub (recommended, auto-deploys on push)**

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the
   repository.
3. Vercel auto-detects Vite. Confirm:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Click **Deploy**. You'll get a `*.vercel.app` URL, with automatic
   redeploys on every push to `main`.
5. To use your own domain: Project → **Settings → Domains** → add your
   domain and follow the DNS instructions.

**Option B: via CLI**

```bash
npm install -g vercel
vercel --prod
```

Follow the prompts on first run (link/create project, confirm build
settings — Vercel will auto-detect Vite).

---

## Project structure

```
index.html          # HTML shell + all SEO/meta tags
src/main.jsx         # React entry point
src/App.jsx          # Entire single-page site (all sections)
src/index.css        # Tailwind directives + a few shared component classes
tailwind.config.js   # Color palette (navy + ember accent), theme tokens
```

Everything lives in one page component (`App.jsx`), broken into small
section functions (`Hero`, `Pain`, `WhatsInside`, `WhoItsFor`, `Preview`,
`Faq`, `FinalCta`, `Footer`) so it's easy to find and edit copy.
