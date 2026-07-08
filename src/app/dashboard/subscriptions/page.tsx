import Link from 'next/link'
import { MerchantLogo } from '@/components/merchant-logo'
import { categoryLabel } from '@/lib/category-label'
import { orgDb } from '@/lib/db'
import { formatMoney } from '@/lib/money'
import { requireOrg } from '@/lib/session'

const CADENCE_LABEL: Record<string, string> = {
  MONTHLY: '/mo',
  ANNUAL: '/yr',
  QUARTERLY: '/qtr',
  WEEKLY: '/wk',
  IRREGULAR: '/mo avg',
}

export default async function SubscriptionsPage() {
  const { org } = await requireOrg()
  const subscriptions = await orgDb(org.id).subscription.findMany({
    orderBy: { currentAmountCents: 'desc' },
    include: { flags: { where: { status: 'OPEN' }, select: { id: true } } },
  })

  if (subscriptions.length === 0) {
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
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-sm text-ink-400">
          {subscriptions.length} detected
        </p>
      </div>

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
