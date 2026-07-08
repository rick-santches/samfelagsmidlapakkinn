import Link from 'next/link'
import { orgDb } from '@/lib/db'
import { formatMoney } from '@/lib/money'
import { requireOrg } from '@/lib/session'

export default async function DashboardPage() {
  const { org } = await requireOrg()
  const db = orgDb(org.id)

  const [report, transactionCount] = await Promise.all([
    db.auditReport.findFirst({ orderBy: { createdAt: 'desc' } }),
    db.transaction.count(),
  ])

  if (!report || transactionCount === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">No spending data yet</h1>
        <p className="mt-2 max-w-md text-ink-300">
          Upload a card or bank statement and Zombly will dig up every
          recurring charge hiding in it.
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
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-6">
          <p className="text-sm text-ink-400">Monthly recurring spend</p>
          <p className="num mt-2 text-4xl font-bold">
            {formatMoney(report.totalMonthlySpendCents)}
          </p>
        </div>
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-6">
          <p className="text-sm text-ink-400">Flagged annual savings</p>
          <p className="num mt-2 text-4xl font-bold text-savings">
            {formatMoney(report.totalFlaggedSavingsCents)}
          </p>
        </div>
      </div>
      <p className="mt-6 text-sm text-ink-400">
        Full money screen lands in Phase 5 — spend over time, category
        breakdown, and the Kill List preview.
      </p>
    </div>
  )
}
