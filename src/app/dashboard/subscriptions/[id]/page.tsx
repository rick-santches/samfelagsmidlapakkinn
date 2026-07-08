import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChargeSparkline } from '@/components/charts/charge-sparkline'
import { MerchantLogo } from '@/components/merchant-logo'
import { categoryLabel } from '@/lib/category-label'
import { prisma } from '@/lib/db'
import { formatMoney } from '@/lib/money'
import { requireOrg } from '@/lib/session'

const CADENCE_LABEL: Record<string, string> = {
  MONTHLY: 'Monthly',
  ANNUAL: 'Annual',
  QUARTERLY: 'Quarterly',
  WEEKLY: 'Weekly',
  IRREGULAR: 'Irregular',
}

const FLAG_LABEL: Record<string, string> = {
  DUPLICATE: 'Duplicate plan',
  OVERLAP: 'Overlapping tool',
  ZOMBIE: 'Zombie charge',
  PRICE_HIKE: 'Price hike',
  TRIAL_CONVERTED: 'Trial converted',
  FORGOTTEN_ANNUAL: 'Renewal ahead',
}

export default async function SubscriptionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { org } = await requireOrg()

  const sub = await prisma.subscription.findFirst({
    where: { id: params.id, orgId: org.id },
    include: {
      charges: {
        include: { transaction: true },
        orderBy: { transaction: { date: 'asc' } },
      },
      flags: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!sub) notFound()

  const charges = sub.charges.map((c) => c.transaction)
  const totalPaidCents = charges.reduce((sum, t) => sum + t.amountCents, 0)
  const spark = charges.map((t) => ({
    label: t.date.toISOString().slice(0, 10),
    amountCents: t.amountCents,
  }))

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/subscriptions" className="text-sm text-ink-400 hover:text-ink-200">
        ← Subscriptions
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <MerchantLogo domain={sub.logoDomain} name={sub.merchantName} size={44} />
        <div>
          <h1 className="text-2xl font-bold">{sub.merchantName}</h1>
          <p className="text-sm text-ink-400">
            {CADENCE_LABEL[sub.cadence] ?? sub.cadence}
            {sub.category ? ` · ${categoryLabel(sub.category)}` : ''} ·{' '}
            {Math.round(sub.confidence * 100)}% confidence
          </p>
        </div>
        <p className="num ml-auto text-2xl font-bold">
          {formatMoney(sub.currentAmountCents)}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="First seen" value={sub.firstSeen.toISOString().slice(0, 10)} />
        <Stat label="Last charge" value={sub.lastSeen.toISOString().slice(0, 10)} />
        <Stat label="Total paid" value={formatMoney(totalPaidCents)} />
      </div>

      {sub.flags.length > 0 && (
        <div className="mt-6 space-y-3">
          {sub.flags.map((flag) => (
            <div
              key={flag.id}
              className="rounded-xl border border-flame/30 bg-ink-900 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-flame/15 px-2 py-0.5 text-xs font-medium text-flame">
                  {FLAG_LABEL[flag.type] ?? flag.type} · {flag.status}
                </span>
                <span className="num text-sm font-semibold text-savings">
                  {formatMoney(flag.estimatedAnnualSavingsCents)}/yr
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-300">{flag.explanation}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-ink-800 bg-ink-900 p-6">
        <h2 className="text-sm font-semibold text-ink-200">Charge history</h2>
        {spark.length > 1 && (
          <div className="mt-3">
            <ChargeSparkline data={spark} />
          </div>
        )}
        <div className="mt-3 max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <tbody>
              {[...charges].reverse().map((tx) => (
                <tr key={tx.id} className="border-t border-ink-800 first:border-t-0">
                  <td className="num py-2 text-ink-300">
                    {tx.date.toISOString().slice(0, 10)}
                  </td>
                  <td className="truncate py-2 pl-4 text-ink-400">
                    {tx.rawDescription}
                  </td>
                  <td className="num py-2 pl-4 text-right font-medium">
                    {formatMoney(tx.amountCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4">
      <p className="text-xs text-ink-400">{label}</p>
      <p className="num mt-1 font-semibold">{value}</p>
    </div>
  )
}
