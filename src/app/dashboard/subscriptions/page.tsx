import type { Prisma, SubscriptionStatus } from '@prisma/client'
import Link from 'next/link'
import { MerchantLogo } from '@/components/merchant-logo'
import { categoryLabel } from '@/lib/category-label'
import { orgDb } from '@/lib/db'
import { formatMoney } from '@/lib/money'
import { requireOrg } from '@/lib/session'
import { SubscriptionFilters } from './filters'

const CADENCE_LABEL: Record<string, string> = {
  MONTHLY: '/mo',
  ANNUAL: '/yr',
  QUARTERLY: '/qtr',
  WEEKLY: '/wk',
  IRREGULAR: '/mo avg',
}

const STATUS_VALUES: SubscriptionStatus[] = ['ACTIVE', 'FLAGGED', 'CANCELED', 'IGNORED']

// Normalize a subscription to an approximate monthly cost for the header total.
// IRREGULAR is already a "/mo avg" figure; the precise per-charge normalization
// lives in monthlyizedCents() (needs charge history the list doesn't load).
function monthlyEquivCents(cadence: string, cents: number): number {
  switch (cadence) {
    case 'WEEKLY':
      return Math.round(cents * 4.33)
    case 'QUARTERLY':
      return Math.round(cents / 3)
    case 'ANNUAL':
      return Math.round(cents / 12)
    default:
      return cents // MONTHLY, IRREGULAR
  }
}

const SORT_ORDER: Record<string, Prisma.SubscriptionOrderByWithRelationInput> = {
  amount: { currentAmountCents: 'desc' },
  name: { merchantName: 'asc' },
  lastSeen: { lastSeen: 'desc' },
  confidence: { confidence: 'desc' },
}

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: { status?: string; category?: string; q?: string; sort?: string }
}) {
  const { org } = await requireOrg()
  const db = orgDb(org.id)

  const status = STATUS_VALUES.find((s) => s === searchParams.status)
  const category = searchParams.category && searchParams.category !== 'ALL'
    ? searchParams.category
    : undefined
  const q = searchParams.q?.trim()
  const orderBy = SORT_ORDER[searchParams.sort ?? 'amount'] ?? SORT_ORDER.amount

  const where: Prisma.SubscriptionWhereInput = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(q ? { merchantName: { contains: q, mode: 'insensitive' } } : {}),
  }

  const [subscriptions, totalCount, categoryRows] = await Promise.all([
    db.subscription.findMany({
      where,
      orderBy,
      include: { flags: { where: { status: 'OPEN' }, select: { id: true } } },
    }),
    db.subscription.count(),
    db.subscription.findMany({
      where: { category: { not: null } },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    }),
  ])
  const categories = categoryRows
    .map((r) => r.category)
    .filter((c): c is string => c !== null)

  // Monthly-equivalent spend across the currently-shown ACTIVE/FLAGGED rows —
  // canceled/ignored aren't ongoing spend, so they're left out of the total.
  // IRREGULAR is excluded too: its single charge can't be reliably normalized to
  // a month without the charge history, and guessing would overcount.
  const monthlyActiveCents = subscriptions
    .filter((s) => (s.status === 'ACTIVE' || s.status === 'FLAGGED') && s.cadence !== 'IRREGULAR')
    .reduce((sum, s) => sum + monthlyEquivCents(s.cadence, s.currentAmountCents), 0)

  if (totalCount === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">No subscriptions yet</h1>
        <p className="mt-2 max-w-md text-ink-300">
          Upload a statement and the detection engine will dig them out —
          even the ones nobody remembers signing up for.
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-ink-400">
            {subscriptions.length === totalCount
              ? `${totalCount} detected`
              : `${subscriptions.length} of ${totalCount}`}
            {monthlyActiveCents > 0 && (
              <span className="num">
                {' · ≈ '}
                <span className="text-ink-200">{formatMoney(monthlyActiveCents)}/mo</span> active
              </span>
            )}
          </p>
        </div>
        <SubscriptionFilters categories={categories} />
      </div>

      {subscriptions.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-400">
          No subscriptions match these filters.
        </p>
      ) : (
      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-800">
        <table className="w-full text-sm">
          <thead className="bg-ink-900 text-left text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Merchant</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Last charge</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-t border-ink-800">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <MerchantLogo domain={sub.logoDomain} name={sub.merchantName} size={24} />
                    <Link
                      href={`/dashboard/subscriptions/${sub.id}`}
                      className="font-medium hover:text-savings hover:underline"
                    >
                      {sub.merchantName}
                    </Link>
                    {sub.flags.length > 0 && (
                      <span className="rounded-full bg-flame/15 px-2 py-0.5 text-xs font-medium text-flame">
                        {sub.flags.length} flag{sub.flags.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </td>
                <td className="num whitespace-nowrap px-4 py-3">
                  {formatMoney(sub.currentAmountCents)}
                  <span className="text-ink-400">
                    {CADENCE_LABEL[sub.cadence] ?? ''}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-300">
                  {sub.category ? categoryLabel(sub.category) : '—'}
                </td>
                <td className="num px-4 py-3 text-ink-300">
                  {sub.lastSeen.toISOString().slice(0, 10)}
                </td>
                <td className="num px-4 py-3 text-ink-300">
                  {Math.round(sub.confidence * 100)}%
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-ink-800 text-ink-200',
    FLAGGED: 'bg-flame/15 text-flame',
    CANCELED: 'bg-ink-800 text-ink-400 line-through',
    IGNORED: 'bg-ink-800 text-ink-400',
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.ACTIVE}`}
    >
      {status}
    </span>
  )
}
