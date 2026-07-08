import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-savings">
        Zombly
      </p>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
        Kill your zombie subscriptions.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-ink-300">
        Upload your business card statements. Zombly finds every recurring
        charge, flags the waste, and hands you a Kill List with the savings to
        prove it.
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
    </main>
  )
}
