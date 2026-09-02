import Link from 'next/link'
import { ZomblyMark } from '@/components/zombly-mark'
import { ScannerDemo } from '@/components/scanner-demo'
import { RevealController } from '@/components/reveal-controller'

const CONTAINER = 'mx-auto w-full max-w-6xl px-6'

const STATS = [
  { value: '6', label: 'kinds of waste hunted', sub: 'zombies · overlaps · duplicates · hikes · trials · forgotten annuals' },
  { value: '~60s', label: 'from upload to audit', sub: 'drop a statement, get results' },
  { value: '$1,400+', label: 'typical yearly waste a first audit surfaces', sub: 'illustrative — your real numbers will vary' },
  { value: '$0', label: 'to run your first audit', sub: 'no card required' },
] as const

const STEPS = [
  {
    n: '01',
    icon: 'upload',
    title: 'Feed it statements',
    body: 'Upload a card or bank CSV — Chase, Amex, BoA, Mercury, Brex and Ramp auto-detected — or connect the bank with Plaid.',
  },
  {
    n: '02',
    icon: 'scan',
    title: 'It hunts the zombies',
    body: 'Zombly clusters every recurring charge and flags the waste: duplicates, overlapping tools, price hikes, trials that grew teeth, renewals about to land.',
  },
  {
    n: '03',
    icon: 'target',
    title: 'You get the Kill List',
    body: 'Swipe through the flags, kill what nobody uses, and export the receipts — savings totaled, cancellation steps included.',
  },
] as const

const FLAG_EXAMPLES = [
  ['Zombie', 'This one has been eating $89/mo since March. Nobody noticed.'],
  ['Overlap', "You're paying for both Zoom and Google Meet. Pick one, save ~$192/yr."],
  ['Price hike', 'Adobe quietly went $54.99 → $59.99 — $60/yr extra, unannounced.'],
] as const

const FEATURES = [
  {
    icon: 'list',
    title: 'The Kill List',
    body: 'Everything you decide to cancel in one place — each with step-by-step cancellation instructions and a direct link.',
  },
  {
    icon: 'savings',
    title: 'Live savings total',
    body: 'A running annual-savings number that climbs as you triage, so the win is always in view.',
  },
  {
    icon: 'export',
    title: 'Exports & reports',
    body: 'Download a CSV or a printable PDF — the receipts to hand whoever signs off on the spend.',
  },
  {
    icon: 'share',
    title: 'Share your win',
    body: 'One tap copies a shareable “I just clawed back $X/yr” summary. Bragging rights, built in.',
  },
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
    <main>
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-ink-800/70 bg-ink-950/80 backdrop-blur">
        <div className={`${CONTAINER} flex h-16 items-center justify-between`}>
          <Link href="/" className="flex items-center gap-2">
            <ZomblyMark size={26} />
            <span className="text-sm font-bold uppercase tracking-[0.22em] text-savings">Zombly</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-ink-300 md:flex">
            <a href="#how" className="transition hover:text-ink-100">How it works</a>
            <a href="#features" className="transition hover:text-ink-100">Features</a>
            <a href="#pricing" className="transition hover:text-ink-100">Pricing</a>
            <a href="#faq" className="transition hover:text-ink-100">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin" className="hidden text-sm font-medium text-ink-300 transition hover:text-ink-100 sm:block">
              Sign in
            </Link>
            <Link
              href="/signin"
              className="rounded-lg bg-savings px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-savings-glow"
            >
              Free audit
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
          style={{ background: 'radial-gradient(60% 55% at 50% 0%, rgba(163,230,53,0.12), rgba(10,14,20,0) 72%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(70% 50% at 50% 0%, #000 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(70% 50% at 50% 0%, #000 30%, transparent 75%)',
          }}
        />
        <div className={`${CONTAINER} grid items-center gap-12 pb-16 pt-16 lg:grid-cols-2 lg:pb-24 lg:pt-24`}>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-800 bg-ink-900 px-3 py-1 text-xs font-medium text-ink-300">
              <span className="h-1.5 w-1.5 rounded-full bg-savings" />
              Subscription &amp; spend audit for small businesses
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
              The subscriptions you forgot are{' '}
              <span className="text-savings">eating you alive.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-300">
              Your business is bleeding money on software nobody uses. Zombly reads your
              statements, hunts every recurring charge, and hands you a Kill List — with receipts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signin"
                className="rounded-lg bg-savings px-6 py-3 font-semibold text-ink-950 shadow-[0_0_36px_-8px_rgba(163,230,53,0.5)] transition hover:bg-savings-glow"
              >
                Start your free audit →
              </Link>
              <a
                href="#how"
                className="rounded-lg border border-ink-700 px-6 py-3 font-semibold text-ink-200 transition hover:border-ink-500 hover:bg-ink-900"
              >
                See how it works
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500">
              <span>No card for the free audit</span>
              <span className="text-ink-700">·</span>
              <span>CSV or bank connect</span>
              <span className="text-ink-700">·</span>
              <span>Flat pricing, no %-of-savings</span>
            </div>
          </div>
          <ScannerDemo />
        </div>
      </section>

      {/* ── Stat strip ── */}
      <section className="reveal border-y border-ink-800/70 bg-ink-900/40">
        <div className={`${CONTAINER} grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4`}>
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="num text-3xl font-bold tracking-tight text-savings sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-ink-200">{s.label}</p>
              <p className="mt-0.5 text-xs text-ink-500">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Atmospheric band: what it flags ── */}
      <section className="reveal relative overflow-hidden border-b border-ink-800/70">
        <ZombieBackdrop />
        <div className={`${CONTAINER} relative grid items-center gap-10 py-20 lg:grid-cols-2`}>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-flame">The undead ledger</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              It doesn’t just list charges.{' '}
              <span className="text-ink-400">It judges them.</span>
            </h2>
            <p className="mt-4 max-w-md text-ink-300">
              Every recurring charge gets grouped, categorized, and cross-checked. The waste bubbles
              up in plain English — with a dollar figure attached.
            </p>
          </div>
          <ul className="space-y-3">
            {FLAG_EXAMPLES.map(([badge, quote]) => (
              <li
                key={badge}
                className="flex items-start gap-3 rounded-xl border border-ink-800 bg-ink-900/80 p-4 backdrop-blur transition hover:border-flame/40"
              >
                <span className="mt-0.5 shrink-0 rounded-full bg-flame/15 px-2.5 py-0.5 text-xs font-semibold text-flame">
                  {badge}
                </span>
                <p className="text-sm text-ink-200">“{quote}”</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="reveal scroll-mt-20">
        <div className={`${CONTAINER} py-20`}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-savings">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to a leaner bill.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="group rounded-2xl border border-ink-800 bg-ink-900 p-7 transition hover:-translate-y-1 hover:border-savings/40 hover:shadow-[0_0_40px_-16px_rgba(163,230,53,0.4)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-savings/10 text-savings">
                    <Icon name={step.icon} />
                  </span>
                  <span className="num text-sm font-bold text-ink-600">{step.n}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature highlights ── */}
      <section id="features" className="reveal scroll-mt-20 border-y border-ink-800/70 bg-ink-900/40">
        <div className={`${CONTAINER} py-20`}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-savings">What you get</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Built to make canceling easy — and satisfying.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-2xl border border-ink-800 bg-ink-950/60 p-6 transition hover:border-savings/40"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-savings/10 text-savings">
                  <Icon name={f.icon} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="reveal scroll-mt-20">
        <div className={`${CONTAINER} py-20`}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Flat pricing. No <span className="text-savings">%-of-savings</span> games.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-ink-400">
              The savings number is your win, not our commission. Annual billing gets you 2 months free.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl border p-6 transition ${
                  plan.highlight
                    ? 'border-savings/60 bg-ink-900 shadow-[0_0_44px_-12px_rgba(163,230,53,0.4)]'
                    : 'border-ink-800 bg-ink-900 hover:border-ink-700'
                }`}
              >
                {plan.highlight && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-savings/15 px-2.5 py-0.5 text-xs font-semibold text-savings">
                    Most popular
                  </span>
                )}
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
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="reveal scroll-mt-20 border-t border-ink-800/70 bg-ink-900/40">
        <div className={`${CONTAINER} py-20`}>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered.</h2>
          <div className="mx-auto mt-10 max-w-2xl divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-950/60">
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
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="reveal relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(60% 100% at 50% 100%, rgba(163,230,53,0.14), rgba(10,14,20,0) 70%)' }}
        />
        <div className={`${CONTAINER} py-24 text-center`}>
          <ZomblyMark size={44} tile />
          <h2 className="mx-auto mt-6 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
            Find out what your business is quietly paying for.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-300">
            The free audit shows what’s leaking in about a minute. No card, no catch.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/signin"
              className="rounded-lg bg-savings px-7 py-3.5 font-semibold text-ink-950 shadow-[0_0_36px_-8px_rgba(163,230,53,0.5)] transition hover:bg-savings-glow"
            >
              Start your free audit →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ink-800">
        <div className={`${CONTAINER} flex flex-col items-center gap-4 py-10 text-center`}>
          <div className="flex items-center gap-2">
            <ZomblyMark size={20} />
            <span className="text-sm font-bold text-savings">Zombly</span>
          </div>
          <p className="text-xs text-ink-600">Built for US small businesses · Flat pricing, no %-of-savings games</p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="/guides" className="text-ink-400 transition hover:text-savings">Cancellation guides</Link>
            <Link href="/terms" className="text-ink-400 transition hover:text-savings">Terms</Link>
            <Link href="/privacy" className="text-ink-400 transition hover:text-savings">Privacy</Link>
            <Link href="/signin" className="text-ink-400 transition hover:text-savings">Sign in</Link>
          </nav>
        </div>
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

      <RevealController />
    </main>
  )
}

/** Decorative, in-repo SVG backdrop for the "what it flags" band — a phone
 *  emitting drifting ghost receipts. Pure SVG so it's crisp and dependency-free. */
function ZombieBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(80% 80% at 80% 50%, rgba(163,230,53,0.08), rgba(10,14,20,0) 60%)' }}
      />
      <svg
        className="absolute right-0 top-1/2 h-[120%] -translate-y-1/2 opacity-[0.5]"
        viewBox="0 0 400 300"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="ghost" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#A3E635" stopOpacity="0" />
            <stop offset="1" stopColor="#A3E635" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {/* drifting receipts */}
        {[
          { x: 250, y: 120, r: -12, o: 0.5 },
          { x: 290, y: 70, r: 8, o: 0.35 },
          { x: 225, y: 60, r: -20, o: 0.25 },
        ].map((g, i) => (
          <g key={i} transform={`translate(${g.x} ${g.y}) rotate(${g.r})`} opacity={g.o}>
            <path
              d="M0 0 h34 v44 l-5 -4 -6 4 -6 -4 -6 4 -6 -4 -5 4 Z"
              fill="url(#ghost)"
              stroke="#A3E635"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
            <line x1="6" y1="10" x2="28" y2="10" stroke="#A3E635" strokeOpacity="0.5" strokeWidth="1.5" />
            <line x1="6" y1="18" x2="24" y2="18" stroke="#A3E635" strokeOpacity="0.4" strokeWidth="1.5" />
            <line x1="6" y1="26" x2="28" y2="26" stroke="#A3E635" strokeOpacity="0.3" strokeWidth="1.5" />
          </g>
        ))}
        {/* phone */}
        <rect x="245" y="150" width="70" height="130" rx="12" fill="#0F141C" stroke="#A3E635" strokeOpacity="0.6" strokeWidth="2" />
        <rect x="253" y="162" width="54" height="96" rx="6" fill="#A3E635" fillOpacity="0.1" />
        <circle cx="280" cy="270" r="4" fill="#A3E635" fillOpacity="0.5" />
      </svg>
    </div>
  )
}

/** Small stroke icon set (currentColor). Pure SVG — crisper than raster for UI icons. */
function Icon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'upload':
      return (
        <svg {...common}>
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          <path d="M12 15V3" />
          <path d="m7 8 5-5 5 5" />
        </svg>
      )
    case 'scan':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M11 8a3 3 0 0 0-3 3" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      )
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      )
    case 'list':
      return (
        <svg {...common}>
          <path d="m3 6 1.5 1.5L7 5" />
          <path d="m3 12 1.5 1.5L7 11" />
          <path d="m3 18 1.5 1.5L7 17" />
          <path d="M11 6h10M11 12h10M11 18h10" />
        </svg>
      )
    case 'savings':
      return (
        <svg {...common}>
          <path d="M3 17l5-5 4 4 8-8" />
          <path d="M15 8h6v6" />
        </svg>
      )
    case 'export':
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="m8 11 4 4 4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      )
    case 'share':
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
        </svg>
      )
    default:
      return null
  }
}
