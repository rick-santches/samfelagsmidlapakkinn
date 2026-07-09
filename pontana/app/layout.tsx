import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { siteConfig } from '@/lib/content'
import './globals.css'

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

// Mobile browser chrome matches the brand background color
export const viewport: Viewport = {
  themeColor: siteConfig.colors.base,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'is_IS',
    type: 'website',
    images: [{ url: siteConfig.images.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
}

const SCHEMA_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function LocalBusinessJsonLd() {
  const { name, description, url, hours, contact, images, reviews, hero } = siteConfig
  const ratingCount = reviews.items.length
  const ratingValue =
    Math.round((reviews.items.reduce((sum, r) => sum + r.rating, 0) / ratingCount) * 10) / 10
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name,
    description,
    url,
    image: images.hero,
    servesCuisine: 'Sjávarréttir',
    priceRange: 'kr kr',
    telephone: contact.phoneHref.replace('tel:', ''),
    email: contact.email,
    acceptsReservations: `${url}${hero.ctaHref}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hours.address.street,
      postalCode: hours.address.postalCode,
      addressLocality: hours.address.city,
      addressCountry: 'IS',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 65.6826,
      longitude: -18.0907,
    },
    openingHoursSpecification: hours.schedule.map((s) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: s.dayNumbers.map((d) => SCHEMA_DAYS[d]),
      opens: s.open,
      closes: s.close,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount: ratingCount,
      bestRating: 5,
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/** "#0b1220" → "11 18 32" for Tailwind's rgb(var(...) / <alpha-value>) colors */
function hexToChannels(hex: string): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((ch) => ch + ch).join('') : h
  const n = parseInt(full, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const c = siteConfig.colors
  const colorVars = {
    '--color-base': c.base,
    '--color-base-rgb': hexToChannels(c.base),
    '--color-surface-rgb': hexToChannels(c.surface),
    '--color-accent': c.accent,
    '--color-accent-rgb': hexToChannels(c.accent),
    '--color-accent-soft': c.accentSoft,
    '--color-ink-rgb': hexToChannels(c.ink),
    '--color-ink-muted-rgb': hexToChannels(c.inkMuted),
    '--color-line': c.line,
  } as React.CSSProperties

  return (
    <html lang="is" className={`${display.variable} ${body.variable}`} style={colorVars}>
      <body>
        <LocalBusinessJsonLd />
        {children}
      </body>
    </html>
  )
}
