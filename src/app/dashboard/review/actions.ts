'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { runPipelineForOrg } from '@/lib/pipeline'
import { requireOrg } from '@/lib/session'

const CADENCE_DAYS: Record<string, number> = {
  WEEKLY: 7,
  MONTHLY: 30,
  QUARTERLY: 91,
  ANNUAL: 365,
  IRREGULAR: 30,
}

/** Load a flag and prove it belongs to the caller's org. */
async function ownedFlag(flagId: string) {
  const { org } = await requireOrg()
  const flag = await prisma.flag.findFirst({
    where: { id: flagId, subscription: { orgId: org.id } },
    include: { subscription: true },
  })
  if (!flag) throw new Error('Flag not found')
  return { flag, orgId: org.id }
}

function revalidate(): void {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/review')
  revalidatePath('/dashboard/killlist')
  revalidatePath('/dashboard/subscriptions')
}

/** "We use it" — dismiss the flag and mark the merchant as confirmed. */
export async function dismissFlag(flagId: string): Promise<void> {
  const { flag, orgId } = await ownedFlag(flagId)
  await prisma.flag.update({ where: { id: flag.id }, data: { status: 'DISMISSED' } })
  await prisma.subscription.updateMany({
    where: { orgId, merchantName: flag.subscription.merchantName },
    data: { confirmedInUseAt: new Date() },
  })
  // Re-run detection: confirming a merchant retires its other
  // zombie/overlap flags via the stale-flag cleanup.
  await runPipelineForOrg(orgId)
  revalidate()
}

/** "Kill it" — resolve the flag onto the Kill List. */
export async function killFlag(flagId: string): Promise<void> {
  const { flag, orgId } = await ownedFlag(flagId)
  await prisma.flag.update({ where: { id: flag.id }, data: { status: 'RESOLVED' } })
  await runPipelineForOrg(orgId)
  revalidate()
}

/** "Remind me at renewal" — hide from review until the next expected charge. */
export async function remindFlag(flagId: string): Promise<void> {
  const { flag } = await ownedFlag(flagId)
  const days = CADENCE_DAYS[flag.subscription.cadence] ?? 30
  const remindAt = new Date(
    flag.subscription.lastSeen.getTime() + days * 86_400_000,
  )
  const floor = new Date(Date.now() + 3 * 86_400_000)
  await prisma.flag.update({
    where: { id: flag.id },
    data: { remindAt: remindAt > floor ? remindAt : floor },
  })
  revalidate()
}
