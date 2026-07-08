import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cancellationInfo } from '@/lib/cancellation'
import { prisma } from '@/lib/db'
import { formatMoney } from '@/lib/money'

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const membership = await prisma.membership.findFirst({
    where: { userId },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  })
  if (!membership) {
    return NextResponse.json({ error: 'No organization' }, { status: 403 })
  }

  const kills = await prisma.flag.findMany({
    where: { status: 'RESOLVED', subscription: { orgId: membership.orgId } },
    orderBy: { estimatedAnnualSavingsCents: 'desc' },
    include: { subscription: { select: { merchantName: true, cadence: true, currentAmountCents: true } } },
  })

  const header = 'Merchant,Flag,Current Price,Cadence,Estimated Annual Savings,Cancellation Difficulty,How To Cancel,Cancellation Link'
  const rows = kills.map((kill) => {
    const cancel = cancellationInfo(kill.subscription.merchantName)
    return [
      kill.subscription.merchantName,
      kill.type,
      formatMoney(kill.subscription.currentAmountCents),
      kill.subscription.cadence,
      formatMoney(kill.estimatedAnnualSavingsCents),
      cancel.difficulty,
      cancel.note,
      cancel.url,
    ]
      .map(csvEscape)
      .join(',')
  })
  const total = kills.reduce((sum, k) => sum + k.estimatedAnnualSavingsCents, 0)
  const csv = [header, ...rows, '', `Total,,,,${formatMoney(total)},,,`].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="zombly-kill-list.csv"',
    },
  })
}
