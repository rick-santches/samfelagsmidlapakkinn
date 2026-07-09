import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BookingForm from '@/components/BookingForm'
import Reveal from '@/components/Reveal'
import { siteConfig } from '@/lib/content'

export const metadata: Metadata = {
  title: `${siteConfig.booking.heading} — ${siteConfig.name}`,
  description: `Pantaðu borð hjá ${siteConfig.name} á Akureyri. Fljótlegt og einfalt.`,
}

export default function BookingPage() {
  const { booking } = siteConfig
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-content px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <div className="mx-auto max-w-xl">
          <Reveal>
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {booking.kicker}
            </p>
            <h1 className="text-center font-display text-4xl font-bold sm:text-5xl">
              {booking.heading}
            </h1>
            <p className="mt-5 text-center text-ink-muted">{booking.intro}</p>
          </Reveal>

          <Reveal delay={150} className="mt-10">
            <BookingForm />
          </Reveal>

          <p className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
            >
              ← {booking.backLabel}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
