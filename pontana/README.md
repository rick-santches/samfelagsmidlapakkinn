# Pontana — demo-vefsíða (PONTANA)

Flaggskips-demo fyrir **„Local Business Starter"** pakkann frá Marinerus ehf:
nútímalegt sjávarréttabistró á Akureyri, byggt til að sýna viðskiptavinum hvað
120.000 kr. vefsíðupakki getur litið út.

**Tech:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · engin
gagnagrunnur, ekkert CMS — allt efni í einni skrá.

## Keyra á eigin vél

```bash
cd pontana
npm install
npm run dev
```

Opnast á `http://localhost:3000`. Framleiðslu-build:

```bash
npm run build && npm start
```

## Senda á Vercel

1. Ýttu repo-inu á GitHub.
2. Farðu á [vercel.com/new](https://vercel.com/new) og fluttu inn repo-ið.
3. Stilltu **Root Directory** á `pontana` — Vercel finnur Next.js
   sjálfkrafa, engin önnur stilling nauðsynleg.
4. (Valfrjálst) Bættu við env-breytum fyrir alvöru tölvupóst:
   - `RESEND_API_KEY` — API lykill frá [resend.com](https://resend.com)
   - `CONTACT_TO_EMAIL` — hvert fyrirspurnir/pantanir eiga að berast

   Án lykils virkar formið samt — innsendingar eru skráðar í loggana og
   notandinn fær staðfestingu.

## Endurmerkja fyrir nýjan viðskiptavin — 5 skref

Allt sýnilegt efni býr í **`lib/content.ts`**. Engin component-breyting þarf.

1. **Nafn & texti** — opnaðu `lib/content.ts`, skiptu út `name`, `tagline`,
   `description`, „Um okkur"-textanum og öllum labels.
2. **Litir** — breyttu `colors`-hlutnum (grunnlitur, accent o.s.frv.). Litirnir
   flæða sjálfkrafa í gegnum allan Tailwind-stílinn sem CSS-breytur.
3. **Myndir** — skiptu út `images.hero` / `images.about` / `images.ogImage`
   URL-um (Unsplash eða eigin myndir; bættu léninu við `next.config.mjs`
   `remotePatterns` ef það er nýtt).
4. **Matseðill, umsagnir, opnunartímar** — uppfærðu `menu.categories`,
   `reviews.items`, `hours.schedule`, heimilisfang, síma og netfang.
   Uppfærðu líka `mapEmbedUrl` með heimilisfangi viðskiptavinarins.
5. **Favicon & lén** — uppfærðu litina í `app/icon.svg` og settu rétt lén í
   `url` í `content.ts`. Búið!

## Skráaskipan

```
lib/content.ts        ← EINA skráin sem þarf að breyta fyrir nýjan viðskiptavin
app/layout.tsx        ← Leturgerðir, metadata, JSON-LD, CSS-litabreytur
app/page.tsx          ← Forsíða (allar sektionir)
app/pontun/page.tsx   ← /pontun — borðapöntunarform
app/api/contact/      ← Form-endapunktur, stubbed fyrir Resend
components/           ← Nav, Hero, About, Menu, Reviews (widget), Hours,
                        Contact, BookingForm, Footer, Reveal, Stars
```

`<Reviews />` er byggt sem sjálfstætt „widget" — það er demo fyrir
**Ummæli**-uppsöluna og má lyfta beint yfir í aðra síðu.
