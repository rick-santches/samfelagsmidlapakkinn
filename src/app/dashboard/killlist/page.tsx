import Link from 'next/link'
import { CountUp } from '@/components/count-up'
import { MerchantLogo } from '@/components/merchant-logo'
import { cancellationInfo } from '@/lib/cancellation'
import { prisma } from '@/lib/db'
import { formatMoney } from '@/lib/money'
import { requireOrg } from '@/lib/session'
import { ExportButtons } from './export-buttons'

const FLAG_LABEL: Record<string, string> = {
  DUPLICATE: 'Duplicate plan',
  OVERLAP: 'Overlapping tool',
  ZOMBIE: 'Zombie charge',
  PRICE_HIKE: 'Price hike',
  TRIAL_CONVERTED: 'Trial converted',
  FORGOTTEN_ANNUAL: 'Renewal ahead',
}

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: 'bg-savings/15 text-savings',
  medium: 'bg-ink-800 text-ink-200',
  painful: 'bg-flame/15 text-flame',
}

export default async function KillListPage() {
  const { org } = await requireOrg()

  const kills = await prisma.flag.findMany({
    where: { status: 'RESOLVED', subscription: { orgId: org.id } },
    orderBy: { estimatedAnnualSavingsCents: 'desc' },
    include: {
      subscription: {
        select: { merchantName: true, logoDomain: true, cadence: true, currentAmountCents: true },
      },
    },
  })

  const totalCents = kills.reduce((sum, k) => sum + k.estimatedAnnualSavingsCents, 0)

  if (kills.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-5xl">🪦</p>
        <h1 className="mt-4 text-2xl font-bold">The Kill List is empty</h1>
        <p className="mt-2 max-w-md text-ink-300">
          Head to review and start deciding. Everything you kill lands here —
          with cancellation instructions and the savings to show the boss.
        </p>
        <Link
          href="/dashboard/review"
          className="mt-6 rounded-lg bg-savings px-6 py-3 font-semibold text-ink-950 transition hover:bg-savings-glow"
        >
          Review flags
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl print:max-w-none">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kill List</h1>
          <p className="mt-1 text-sm text-ink-400">
            {kills.length} subscription{kills.length === 1 ? '' : 's'} marked for
            death · {org.name}
          </p>
        </div>
        <ExportButtons />
      </div>

      <div className="mt-6 rounded-xl border border-savings/30 bg-ink-900 p-6 print:border-black/20">
        <p className="text-sm text-ink-400">Total annual savings when executed</p>
        <CountUp
          cents={totalCents}
          whole
          className="mt-1 block text-5xl font-bold tracking-tight text-savings"
        />
      </div>

      <ul className="mt-6 space-y-4">
        {kills.map((kill) => {
          const cancel = cancellationInfo(kill.subscription.merchantName)
          return (
            <li
              key={kill.id}
              className="rounded-xl border border-ink-800 bg-ink-900 p-5 print:break-inside-avoid"
            >
              <div className="flex items-start gap-4">
                <MerchantLogo
                  domain={kill.subscription.logoDomain}
                  name={kill.subscription.merchantName}
                  size={32}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{kill.subscription.merchantName}</p>
                    <span className="rounded-full bg-flame/15 px-2 py-0.5 text-xs font-medium text-flame">
                      {FLAG_LABEL[kill.type] ?? kill.type}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLE[cancel.difficulty]}`}
                    >
                      {cancel.difficulty} to cancel
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-300">{kill.explanation}</p>
                  <p className="mt-2 text-sm text-ink-400">
                    <span className="font-medium text-ink-200">How to cancel:</span>{' '}
                    {cancel.note}{' '}
                    {cancel.url && (
                      <a
                        href={cancel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-savings underline-offset-2 hover:underline"
                      >
                        Cancellation page ↗
                      </a>
                    )}
                  </p>
                </div>
                <p className="num shrink-0 text-lg font-bold text-savings">
                  {formatMoney(kill.estimatedAnnualSavingsCents)}/yr
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-6 text-xs text-ink-500 print:text-black/60">
        Savings are estimates based on detected charges. Generated by Zombly —
        kill your zombie subscriptions.
      </p>
    </div>
  )
}
