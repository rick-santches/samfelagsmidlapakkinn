import { orgDb, prisma } from './db'

export interface MonthlySpendPoint {
  /** "2026-03" */
  month: string
  /** "Mar" or "Mar '26" for January */
  label: string
  spendCents: number
}

export interface CategorySlice {
  category: string
  monthlyCents: number
}

export interface FlagPreview {
  id: string
  type: string
  severity: string
  explanation: string
  estimatedAnnualSavingsCents: number
  merchantName: string
  logoDomain: string | null
}

export interface DashboardData {
  totalMonthlySpendCents: number
  totalFlaggedSavingsCents: number
  openFlagCount: number
  activeSubscriptionCount: number
  spendSeries: MonthlySpendPoint[]
  categories: CategorySlice[]
  killListPreview: FlagPreview[]
  hasData: boolean
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export async function getDashboardData(orgId: string): Promise<DashboardData> {
  const db = orgDb(orgId)

  const [report, recurringCharges, openFlags, openFlagCount, activeSubscriptionCount] =
    await Promise.all([
      db.auditReport.findFirst({ orderBy: { createdAt: 'desc' } }),
      // Only charges the engine attributed to a subscription — this is
      // recurring spend over time, not total card volume.
      db.transaction.findMany({
        where: { amountCents: { gt: 0 }, subscriptionCharges: { some: {} } },
        select: { date: true, amountCents: true },
      }),
      prisma.flag.findMany({
        where: { status: 'OPEN', subscription: { orgId } },
        orderBy: { estimatedAnnualSavingsCents: 'desc' },
        take: 4,
        include: {
          subscription: { select: { merchantName: true, logoDomain: true } },
        },
      }),
      prisma.flag.count({ where: { status: 'OPEN', subscription: { orgId } } }),
      db.subscription.count({ where: { status: { in: ['ACTIVE', 'FLAGGED'] } } }),
    ])

  const byMonth = new Map<string, number>()
  for (const charge of recurringCharges) {
    const key = charge.date.toISOString().slice(0, 7)
    byMonth.set(key, (byMonth.get(key) ?? 0) + charge.amountCents)
  }

  const spendSeries: MonthlySpendPoint[] = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-18)
    .map(([month, spendCents]) => {
      const [year, monthNum] = month.split('-')
      const name = MONTHS[Number(monthNum) - 1] ?? month
      const label =
        monthNum === '01' ? `${name} '${(year ?? '').slice(2)}` : name
      return { month, label, spendCents }
    })

  const snapshot = (report?.snapshot ?? {}) as {
    topCategories?: CategorySlice[]
  }

  return {
    totalMonthlySpendCents: report?.totalMonthlySpendCents ?? 0,
    totalFlaggedSavingsCents: report?.totalFlaggedSavingsCents ?? 0,
    openFlagCount,
    activeSubscriptionCount,
    spendSeries,
    categories: snapshot.topCategories ?? [],
    killListPreview: openFlags.map((flag) => ({
      id: flag.id,
      type: flag.type,
      severity: flag.severity,
      explanation: flag.explanation,
      estimatedAnnualSavingsCents: flag.estimatedAnnualSavingsCents,
      merchantName: flag.subscription.merchantName,
      logoDomain: flag.subscription.logoDomain,
    })),
    hasData: report !== null,
  }
}
