import type { Flag, Subscription } from '@prisma/client'
import { prisma } from './db'
import { sendEmail } from './email'
import { instantFlagEmail, weeklyDigestEmail } from './email-templates'
import { formatMoney } from './money'
import { planSpec } from './plans'

const FLAG_LABEL: Record<string, string> = {
  DUPLICATE: 'duplicate plan',
  OVERLAP: 'overlapping tool',
  ZOMBIE: 'zombie charge',
  PRICE_HIKE: 'price hike',
  TRIAL_CONVERTED: 'trial converted',
  FORGOTTEN_ANNUAL: 'renewal ahead',
}

const CADENCE_LABEL: Record<string, string> = {
  MONTHLY: '/mo',
  ANNUAL: '/yr',
  QUARTERLY: '/qtr',
  WEEKLY: '/wk',
  IRREGULAR: '/mo avg',
}

async function recipientsFor(
  orgId: string,
  pref: 'emailInstantAlerts' | 'emailWeeklyDigest',
): Promise<string[]> {
  const memberships = await prisma.membership.findMany({
    where: { orgId, [pref]: true },
    include: { user: { select: { email: true } } },
  })
  return memberships.map((m) => m.user.email)
}

/**
 * Instant emails for freshly created PRICE_HIKE / TRIAL_CONVERTED flags.
 * Alerts are a paid-plan feature; free orgs get nothing (their flags are
 * locked anyway).
 */
export async function sendInstantFlagAlerts(
  orgId: string,
  flags: Array<Flag & { merchantName: string }>,
): Promise<void> {
  const alertable = flags.filter(
    (f) => f.type === 'PRICE_HIKE' || f.type === 'TRIAL_CONVERTED',
  )
  if (alertable.length === 0) return

  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org || !planSpec(org.plan).flagsUnlocked) return

  const to = await recipientsFor(orgId, 'emailInstantAlerts')
  if (to.length === 0) return

  for (const flag of alertable) {
    const message = instantFlagEmail({
      orgName: org.name,
      flagType: flag.type as 'PRICE_HIKE' | 'TRIAL_CONVERTED',
      merchantName: flag.merchantName,
      explanation: flag.explanation,
      estimatedAnnualSavingsCents: flag.estimatedAnnualSavingsCents,
    })
    await sendEmail({ to, ...message })
  }
}

/** Everything the weekly digest needs for one org; null = nothing to send. */
export async function buildAndSendWeeklyDigest(org: {
  id: string
  name: string
  plan: Parameters<typeof planSpec>[0]
}): Promise<boolean> {
  if (!planSpec(org.plan).flagsUnlocked) return false

  const to = await recipientsFor(org.id, 'emailWeeklyDigest')
  if (to.length === 0) return false

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000)

  const [newSubs, annualSubs, newFlags, report] = await Promise.all([
    prisma.subscription.findMany({
      where: { orgId: org.id, createdAt: { gte: weekAgo }, status: { in: ['ACTIVE', 'FLAGGED'] } },
      orderBy: { currentAmountCents: 'desc' },
      take: 10,
    }),
    prisma.subscription.findMany({
      where: { orgId: org.id, cadence: 'ANNUAL', status: { in: ['ACTIVE', 'FLAGGED'] } },
    }),
    prisma.flag.findMany({
      where: { subscription: { orgId: org.id }, status: 'OPEN', createdAt: { gte: weekAgo } },
      include: { subscription: { select: { merchantName: true } } },
      orderBy: { estimatedAnnualSavingsCents: 'desc' },
      take: 10,
    }),
    prisma.auditReport.findFirst({
      where: { orgId: org.id },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const upcomingRenewals = annualSubs
    .map((sub: Subscription) => {
      const renewal = new Date(sub.lastSeen.getTime() + 365 * 86_400_000)
      const inDays = Math.round((renewal.getTime() - now.getTime()) / 86_400_000)
      return { merchantName: sub.merchantName, amountCents: sub.currentAmountCents, inDays }
    })
    .filter((r) => r.inDays >= 0 && r.inDays <= 14)
    .sort((a, b) => a.inDays - b.inDays)

  const message = weeklyDigestEmail({
    orgName: org.name,
    newSubscriptions: newSubs.map((sub) => ({
      merchantName: sub.merchantName,
      amountLabel: `${formatMoney(sub.currentAmountCents)}${CADENCE_LABEL[sub.cadence] ?? ''}`,
    })),
    upcomingRenewals,
    newFlags: newFlags.map((flag) => ({
      merchantName: flag.subscription.merchantName,
      typeLabel: FLAG_LABEL[flag.type] ?? flag.type.toLowerCase(),
      savingsCents: flag.estimatedAnnualSavingsCents,
    })),
    totalFlaggedSavingsCents: report?.totalFlaggedSavingsCents ?? 0,
  })

  await sendEmail({ to, ...message })
  return true
}
