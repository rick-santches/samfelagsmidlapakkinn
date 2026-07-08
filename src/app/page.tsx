import Link from 'next/link'

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

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-4xl px-6">
      <section className="flex min-h-[70vh] flex-col items-center justify-center pt-20 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-savings">
          Zombly
        </p>
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

      <section className="pb-24">
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
        <p className="mt-10 text-center text-xs text-ink-600">
          Zombly · Built for US small businesses · Flat pricing, no
          %-of-savings games
        </p>
      </section>
    </main>
  )
}
