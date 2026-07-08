import Link from 'next/link'
import { CategoryDonut } from '@/components/charts/category-donut'
import { SpendOverTimeChart } from '@/components/charts/spend-over-time'
import { CountUp } from '@/components/count-up'
import { MerchantLogo } from '@/components/merchant-logo'
import { getDashboardData } from '@/lib/dashboard-data'
import { formatMoney } from '@/lib/money'
import { requireOrg } from '@/lib/session'

const FLAG_LABEL: Record<string, string> = {
  DUPLICATE: 'Duplicate',
  OVERLAP: 'Overlap',
  ZOMBIE: 'Zombie',
  PRICE_HIKE: 'Price hike',
  TRIAL_CONVERTED: 'Trial converted',
  FORGOTTEN_ANNUAL: 'Renewal ahead',
}

export default async function DashboardPage() {
  const { org } = await requireOrg()
  const data = await getDashboardData(org.id, org.plan)
  const locked = data.killListPreview.some((f) => f.locked)

  if (!data.hasData) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-5xl">🧟</p>
        <h1 className="mt-4 text-2xl font-bold">No spending data yet</h1>
        <p className="mt-2 max-w-md text-ink-300">
          Upload a card or bank statement and Zombly will dig up every
          recurring charge hiding in it — and tell you which ones deserve
          to die.
        </p>
        <Link
          href="/dashboard/sources"
          className="mt-6 rounded-lg bg-savings px-6 py-3 font-semibold text-ink-950 transition hover:bg-savings-glow"
        >
          Upload a statement
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-ink-400">
          {data.activeSubscriptionCount} active subscriptions
        </p>
      </div>

      {/* Hero numbers */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-6">
          <p className="text-sm text-ink-400">Monthly recurring spend</p>
          <CountUp
            cents={data.totalMonthlySpendCents}
            className="mt-2 block text-4xl font-bold tracking-tight"
          />
          <p className="num mt-1 text-xs text-ink-500">
            {formatMoney(data.totalMonthlySpendCents * 12)} a year, on autopilot
          </p>
        </div>
        <div className="rounded-xl border border-savings/30 bg-ink-900 p-6">
          <p className="text-sm text-ink-400">Flagged annual savings</p>
          <CountUp
            cents={data.totalFlaggedSavingsCents}
            whole
            className="mt-2 block text-5xl font-bold tracking-tight text-savings"
          />
          <p className="mt-1 text-xs text-ink-500">
            {data.openFlagCount} open flag{data.openFlagCount === 1 ? '' : 's'} waiting
            in{' '}
            <Link href="/dashboard/review" className="text-savings underline-offset-2 hover:underline">
              review
            </Link>
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 lg:col-span-3">
          <h2 className="text-sm font-semibold text-ink-200">
            Recurring spend over time
          </h2>
          <div className="mt-4">
            {data.spendSeries.length > 1 ? (
              <SpendOverTimeChart data={data.spendSeries} />
            ) : (
              <p className="py-16 text-center text-sm text-ink-500">
                Not enough history for a trend yet.
              </p>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink-200">
            Where it goes each month
          </h2>
          <div className="mt-4">
            <CategoryDonut categories={data.categories} />
          </div>
        </div>
      </div>

      {/* Kill List preview */}
      <div className="mt-4 rounded-xl border border-ink-800 bg-ink-900 p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink-200">
            Biggest money leaks
          </h2>
          <Link
            href={locked ? '/dashboard/settings#billing' : '/dashboard/review'}
            className="text-xs font-medium text-savings hover:underline"
          >
            {locked ? 'Unlock your Kill List →' : `Review all ${data.openFlagCount} →`}
          </Link>
        </div>
        {data.killListPreview.length === 0 ? (
          <p className="mt-4 text-sm text-ink-400">
            Nothing flagged. Either you run a tight ship, or the zombies are
            hiding in a statement you haven&apos;t uploaded yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-800">
            {data.killListPreview.map((flag) => (
              <li key={flag.id} className="flex items-start gap-4 py-3">
                <div className="mt-0.5">
                  <MerchantLogo domain={flag.logoDomain} name={flag.merchantName} size={28} />
                </div>
                <div className={`min-w-0 flex-1 ${flag.locked ? 'select-none' : ''}`}>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${flag.locked ? 'text-ink-500' : ''}`}>
                      {flag.merchantName}
                    </p>
                    <span className="rounded-full bg-flame/15 px-2 py-0.5 text-xs font-medium text-flame">
                      {FLAG_LABEL[flag.type] ?? flag.type}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-300">{flag.explanation}</p>
                </div>
                <p className="num shrink-0 font-semibold text-savings">
                  {formatMoney(flag.estimatedAnnualSavingsCents)}/yr
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
