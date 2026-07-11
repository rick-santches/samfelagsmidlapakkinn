import Link from 'next/link'
import { ZomblyMark } from '@/components/zombly-mark'

const STEPS = [
  {
    title: 'Feed it statements',
    body: 'Upload card/bank CSVs (Chase, Amex, BoA, Mercury, Brex, Ramp auto-detected) or connect the bank with Plaid.',
  },
  {
    title: 'It finds the zombies',
    body: 'Every recurring charge, grouped and categorized: duplicates, overlapping tools, price hikes, trials that grew teeth, renewals about to land.',
  },
  {
    title: 'You get the Kill List',
    body: 'Swipe through flags, kill what nobody uses, export the receipts — savings totaled, cancellation steps included.',
  },
]

const FLAG_EXAMPLES = [
  ['Zombie', 'This subscription has been eating $89/mo since March. Nobody noticed.'],
  ['Overlap', "You're paying for both Zoom and Google Meet. Pick one and save ~$192/yr."],
  ['Price hike', 'Adobe quietly went $54.99 → $59.99. That’s $60/yr extra, unannounced.'],
] as const

const PRICING = [
  {
    name: 'Free Audit',
    price: '$0',
    period: '',
    blurb: 'See what’s leaking before you spend a cent.',
    features: ['Upload one statement', 'Total recurring spend', 'How many flags we found', 'Flag details stay locked'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Solo',
    price: '$19',
    period: '/mo',
    blurb: 'For the office manager who runs a tight ship.',
    features: ['1 source', 'Every flag, fully explained', 'The Kill List + exports', 'Instant + weekly email alerts'],
    cta: 'Go Solo',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/mo',
    blurb: 'For companies with real SaaS sprawl.',
    features: ['Unlimited sources', 'Bank connections (Plaid)', 'PDF reports for the boss', '5 seats'],
    cta: 'Go Team',
    highlight: false,
  },
] as const

const FAQS = [
  {
    q: 'How does Zombly work?',
    a: 'Upload your business card or bank statement (CSV), or connect the bank directly. Zombly detects every recurring charge, groups them into subscriptions, and flags the waste: duplicates, overlapping tools, zombie charges nobody uses, price hikes, and trials that quietly converted. You review each flag and everything you decide to cancel lands on a Kill List with cancellation instructions and total savings.',
  },
  {
    q: 'Is my financial data safe?',
    a: 'Yes. Every query is locked to your organization at the database layer, bank connection tokens are encrypted at rest with AES-256, raw transaction descriptions are never written to logs, and we never sell or share your data. You can also use CSV uploads only — then no bank credentials ever touch Zombly.',
  },
  {
    q: 'Do I have to connect my bank?',
    a: 'No. CSV upload is a first-class citizen — the detection is identical. Bank connections via Plaid are an optional convenience on the Team plan that keeps new charges syncing automatically.',
  },
  {
    q: 'Which banks and cards are supported?',
    a: 'CSV exports from Chase, American Express, Bank of America, Mercury, Brex, and Ramp are auto-detected. Any other bank works too — you just point at the date, description, and amount columns once.',
  },
  {
    q: 'What does it cost?',
    a: 'The Free Audit shows your total recurring spend and how many flags we found — no card required. Solo is $19/mo and unlocks every flag with full explanations. Team is $49/mo with unlimited sources, bank connections, and 5 seats. Annual billing gets you 2 months free. Payments are handled by PayPal — pay by card or PayPal balance.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'One click in Settings, effective immediately. We are literally a tool for canceling subscriptions — we’d deserve a flag of our own otherwise.',
  },
] as const

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-4xl px-6">
      <section className="flex min-h-[70vh] flex-col items-center justify-center pt-20 text-center">
        <div className="mb-5 flex flex-col items-center gap-3">
          <ZomblyMark size={76} />
          <p className="text-base font-bold uppercase tracking-[0.25em] text-savings">
            Zombly
          </p>
        </div>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
          Kill your zombie subscriptions.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-300">
          Your business is paying for software nobody uses. Zombly reads your
          statements, finds every recurring charge, and shows you exactly what
          to cancel — with receipts.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/signin"
            className="rounded-lg bg-savings px-6 py-3 font-semibold text-ink-950 transition hover:bg-savings-glow"
          >
            Start your free audit
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-ink-700 px-6 py-3 font-semibold text-ink-200 transition hover:border-ink-500"
          >
            Dashboard
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-500">
          Free audit shows what&apos;s leaking. Plans from $19/mo unlock the
          Kill List.
        </p>
      </section>

      <section className="grid gap-6 pb-8 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="rounded-xl border border-ink-800 bg-ink-900 p-6">
            <p className="num text-sm font-bold text-savings">0{i + 1}</p>
            <h2 className="mt-2 font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">{step.body}</p>
          </div>
        ))}
      </section>

      <section className="pb-8">
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-6">
          <p className="text-sm font-semibold text-ink-200">
            The kind of thing it says about your spending:
          </p>
          <ul className="mt-4 space-y-3">
            {FLAG_EXAMPLES.map(([badge, quote]) => (
              <li key={badge} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 rounded-full bg-flame/15 px-2 py-0.5 text-xs font-medium text-flame">
                  {badge}
                </span>
                <p className="text-sm text-ink-300">&ldquo;{quote}&rdquo;</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-8 pb-8 pt-12">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Flat pricing. No <span className="text-savings">%-of-savings</span> games.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm text-ink-400">
          The savings number is your win, not our commission. Annual billing
          gets you 2 months free.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-6 ${
                plan.highlight
                  ? 'border-savings/60 bg-ink-900 shadow-[0_0_40px_-12px_rgba(163,230,53,0.35)]'
                  : 'border-ink-800 bg-ink-900'
              }`}
            >
              <p className="font-semibold">{plan.name}</p>
              <p className="num mt-3 text-4xl font-bold">
                {plan.price}
                <span className="text-base font-normal text-ink-400">{plan.period}</span>
              </p>
              <p className="mt-2 text-xs text-ink-400">{plan.blurb}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-ink-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 text-savings">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signin"
                className={`mt-6 rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                  plan.highlight
                    ? 'bg-savings text-ink-950 hover:bg-savings-glow'
                    : 'border border-ink-700 text-ink-200 hover:border-ink-500'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-8 pb-16 pt-12">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Questions, answered.
        </h2>
        <div className="mx-auto mt-8 max-w-2xl divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-900">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink-100">
                {faq.q}
                <span className="text-ink-500 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-800 py-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <ZomblyMark size={20} />
          <span className="text-sm font-bold text-savings">Zombly</span>
        </div>
        <p className="text-xs text-ink-600">
          Built for US small businesses · Flat pricing, no %-of-savings games ·{' '}
          <Link href="/signin" className="text-ink-400 hover:text-savings">
            Sign in
          </Link>
        </p>
      </footer>

      {/* Structured data: FAQ + product, so search engines can read them */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                name: 'Zombly',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                description:
                  'Subscription and spend auditing for small businesses: detects recurring charges, flags waste, and generates a Kill List with estimated annual savings.',
                offers: [
                  { '@type': 'Offer', name: 'Free Audit', price: '0', priceCurrency: 'USD' },
                  { '@type': 'Offer', name: 'Solo', price: '19', priceCurrency: 'USD' },
                  { '@type': 'Offer', name: 'Team', price: '49', priceCurrency: 'USD' },
                ],
              },
              {
                '@type': 'FAQPage',
                mainEntity: FAQS.map((faq) => ({
                  '@type': 'Question',
                  name: faq.q,
                  acceptedAnswer: { '@type': 'Answer', text: faq.a },
                })),
              },
            ],
          }),
        }}
      />
    </main>
  )
}
