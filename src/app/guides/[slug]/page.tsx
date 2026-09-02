import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MerchantLogo } from '@/components/merchant-logo'
import { ZomblyMark } from '@/components/zombly-mark'
import { DIFFICULTY_COPY, GUIDES, guideBySlug, relatedGuides } from '@/lib/guides'

const PREFIX = 'how-to-cancel-'

export function generateStaticParams(): Array<{ slug: string }> {
  return GUIDES.map((guide) => ({ slug: `${PREFIX}${guide.slug}` }))
}

function resolve(param: string) {
  if (!param.startsWith(PREFIX)) return undefined
  return guideBySlug(param.slice(PREFIX.length))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = resolve(params.slug)
  if (!guide) return {}
  return {
    title: `How to cancel ${guide.merchant} (${new Date().getFullYear()})`,
    description: `Cancel ${guide.merchant} step by step: where the cancel button hides, how hard ${guide.merchant} makes it, and the traps to avoid. ${guide.note}`,
    alternates: { canonical: `/guides/${PREFIX}${guide.slug}` },
  }
}

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: 'bg-savings/15 text-savings',
  medium: 'bg-ink-800 text-ink-200',
  painful: 'bg-flame/15 text-flame',
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = resolve(params.slug)
  if (!guide) notFound()

  const difficulty = DIFFICULTY_COPY[guide.difficulty]
  const steps = [
    {
      title: `Open ${guide.merchant}'s billing page`,
      body: guide.url
        ? `Go directly to the billing/cancellation area — you'll usually need an admin or owner account.`
        : 'Log in and head to account or billing settings.',
    },
    {
      title: 'Find the cancel option',
      body: guide.note,
    },
    {
      title: 'Get it in writing',
      body: 'Screenshot the confirmation screen and keep the confirmation email. No email means the cancellation may not have gone through — check again before the next billing date.',
    },
    {
      title: 'Watch the next statement',
      body: `Verify no new ${guide.merchant} charge appears on your next card statement. If one does, dispute it with the confirmation you saved.`,
    },
  ]

  const related = relatedGuides(guide)

  return (
    <main className="mx-auto max-w-2xl px-6 pb-20">
      <header className="pt-12">
        <Link href="/guides" className="text-sm text-ink-400 hover:text-ink-200">
          ← All cancellation guides
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <MerchantLogo domain={guide.domain} name={guide.merchant} size={44} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              How to cancel {guide.merchant}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-medium ${DIFFICULTY_BADGE[guide.difficulty]}`}>
                {difficulty.label}
              </span>
              {guide.categoryName && (
                <span className="rounded-full bg-ink-800 px-2 py-0.5 text-ink-300">
                  {guide.categoryName}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-4 text-ink-300">{difficulty.blurb}</p>
      </header>

      <ol className="mt-10 space-y-6">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-xl border border-ink-800 bg-ink-900 p-5">
            <p className="flex items-center gap-3 font-semibold">
              <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-savings/15 text-sm text-savings">
                {i + 1}
              </span>
              {step.title}
            </p>
            <p className="mt-2 pl-10 text-sm leading-relaxed text-ink-300">{step.body}</p>
            {i === 0 && guide.url && (
              <p className="mt-3 pl-10">
                <a
                  href={guide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-savings underline-offset-2 hover:underline"
                >
                  {guide.merchant} cancellation page ↗
                </a>
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-2xl border border-savings/30 bg-ink-900 p-7 text-center">
        <div className="mb-3 flex justify-center">
          <ZomblyMark size={34} />
        </div>
        <h2 className="text-xl font-bold">
          {guide.merchant} probably isn&apos;t your only zombie.
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-300">
          The average small business pays for 3–5 tools nobody uses. Upload a
          statement and Zombly finds all of them in about a minute — free.
        </p>
        <Link
          href="/signin"
          className="mt-4 inline-block rounded-lg bg-savings px-6 py-2.5 font-semibold text-ink-950 transition hover:bg-savings-glow"
        >
          Find my zombie subscriptions
        </Link>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold text-ink-300">More cancellation guides</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/guides/${PREFIX}${r.slug}`}
                className="rounded-lg border border-ink-800 bg-ink-900 px-4 py-2.5 text-sm transition hover:border-ink-600"
              >
                How to cancel {r.merchant}
              </Link>
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: `How to cancel ${guide.merchant}`,
            description: guide.note,
            step: steps.map((step, i) => ({
              '@type': 'HowToStep',
              position: i + 1,
              name: step.title,
              text: step.body,
            })),
          }),
        }}
      />
    </main>
  )
}
