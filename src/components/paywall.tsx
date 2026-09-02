import Link from 'next/link'
import { formatMoneyWhole } from '@/lib/money'

/**
 * The conversion moment: free users see THAT money is leaking,
 * paying users see WHERE. Savings total shown, details locked.
 */
export function Paywall({
  flaggedSavingsCents,
  openFlagCount,
}: {
  flaggedSavingsCents: number
  openFlagCount: number
}) {
  return (
    <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
      <p className="text-5xl">🔒</p>
      <h1 className="mt-4 text-2xl font-bold">
        {openFlagCount > 0 ? (
          <>
            We found{' '}
            <span className="text-savings">
              ~{formatMoneyWhole(flaggedSavingsCents)}/yr
            </span>{' '}
            you could stop paying
          </>
        ) : (
          'Your Kill List is waiting'
        )}
      </h1>
      <p className="mt-3 text-ink-300">
        {openFlagCount} flag{openFlagCount === 1 ? '' : 's'} — duplicates,
        zombies, price hikes — with plain-English explanations and exactly how
        to cancel each one. That&apos;s the part behind the lock.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/dashboard/settings#billing"
          className="rounded-lg bg-savings px-6 py-3 font-semibold text-ink-950 transition hover:bg-savings-glow"
        >
          Unlock your Kill List — from $19/mo
        </Link>
      </div>
      <p className="mt-3 text-xs text-ink-500">
        Annual billing gets you 2 months free. Cancel anytime — we&apos;d
        respect nothing less.
      </p>
    </div>
  )
}
