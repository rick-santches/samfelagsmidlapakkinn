import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zombly.vercel.app'
const DESCRIPTION =
  'Zombly finds recurring charges hiding in your business spending, flags duplicates, overlaps, price hikes, and unused tools — and shows exactly what to cancel, with receipts. Free audit; plans from $19/mo.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Zombly — Kill your zombie subscriptions',
    template: '%s · Zombly',
  },
  description: DESCRIPTION,
  keywords: [
    'subscription management',
    'SaaS spend',
    'recurring charges',
    'cancel subscriptions',
    'expense audit',
    'small business software',
  ],
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'Zombly',
    title: 'Zombly — Kill your zombie subscriptions',
    description: DESCRIPTION,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Zombly — kill your zombie subscriptions' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zombly — Kill your zombie subscriptions',
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
