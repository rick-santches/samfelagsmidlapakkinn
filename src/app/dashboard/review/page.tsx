import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireOrg } from '@/lib/session'
import { ReviewDeck } from './review-deck'

export default async function ReviewPage() {
  const { org } = await requireOrg()

  const flags = await prisma.flag.findMany({
    where: {
      status: 'OPEN',
      subscription: { orgId: org.id },
      OR: [{ remindAt: null }, { remindAt: { lte: new Date() } }],
    },
    orderBy: { estimatedAnnualSavingsCents: 'desc' },
    include: {
      subscription: {
        select: {
          merchantName: true,
          logoDomain: true,
          cadence: true,
          currentAmountCents: true,
          category: true,
        },
      },
    },
  })

  if (flags.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-5xl">🧟‍♂️✅</p>
        <h1 className="mt-4 text-2xl font-bold">Review queue clear</h1>
        <p className="mt-2 max-w-md text-ink-300">
          Every flag has been dealt with. New statements bring new zombies —
          upload the next one when it lands.
        </p>
        <Link
          href="/dashboard/killlist"
          className="mt-6 rounded-lg bg-savings px-6 py-3 font-semibold text-ink-950 transition hover:bg-savings-glow"
        >
          See your Kill List
        </Link>
      </div>
    )
  }

  return (
    <ReviewDeck
      flags={flags.map((flag) => ({
        id: flag.id,
        type: flag.type,
        severity: flag.severity,
        explanation: flag.explanation,
        estimatedAnnualSavingsCents: flag.estimatedAnnualSavingsCents,
        merchantName: flag.subscription.merchantName,
        logoDomain: flag.subscription.logoDomain,
        cadence: flag.subscription.cadence,
        currentAmountCents: flag.subscription.currentAmountCents,
      }))}
    />
  )
}
