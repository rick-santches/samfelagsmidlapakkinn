import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Zombly — Kill your zombie subscriptions',
  description:
    'Zombly finds recurring charges hiding in your business spending, flags duplicates, overlaps, price hikes, and unused tools — and shows exactly what to cancel, with receipts.',
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
