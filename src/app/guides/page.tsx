import type { Metadata } from 'next'
import Link from 'next/link'
import { MerchantLogo } from '@/components/merchant-logo'
import { ZomblyMark } from '@/components/zombly-mark'
import { GUIDES } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'How to cancel any business subscription',
  description:
    'Step-by-step cancellation guides for Slack, Adobe, HubSpot, Dropbox, and dozens more — with honest difficulty ratings and the traps to watch for.',
  alternates: { canonical: '/guides' },
}

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: 'bg-savings/15 text-savings',
  medium: 'bg-ink-800 text-ink-200',
  painful: 'bg-flame/15 text-flame',
}

export default function GuidesIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 pb-20">
      <header className="pt-14 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <ZomblyMark size={24} />
          <span className="text-sm font-bold uppercase tracking-widest text-savings">Zombly</span>
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">
          How to cancel any subscription.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-300">
          Honest, step-by-step cancellation guides — including how hard each
          vendor makes it and the traps to watch for. No login required.
        </p>
      </header>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/how-to-cancel-${guide.slug}`}
            className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-900 p-4 transition hover:border-ink-600"
          >
            <MerchantLogo domain={guide.domain} name={guide.merchant} size={28} />
            <div className="min-w-0 flex-1">
              <p className="font-medium">How to cancel {guide.merchant}</p>
              {guide.categoryName && (
                <p className="text-xs text-ink-500">{guide.categoryName}</p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_BADGE[guide.difficulty]}`}
            >
              {guide.difficulty}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-savings/30 bg-ink-900 p-8 text-center">
        <h2 className="text-2xl font-bold">
          Not sure what you&apos;re even paying for?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-300">
          Upload a card statement and Zombly finds every recurring charge,
          flags the waste, and builds your cancellation Kill List automatically.
        </p>
        <Link
          href="/signin"
          className="mt-5 inline-block rounded-lg bg-savings px-6 py-3 font-semibold text-ink-950 transition hover:bg-savings-glow"
        >
          Run a free audit
        </Link>
      </div>
    </main>
  )
}
