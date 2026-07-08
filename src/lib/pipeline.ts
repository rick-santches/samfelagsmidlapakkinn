import type { Flag, FlagSeverity, FlagType, Prisma } from '@prisma/client'
import { sendInstantFlagAlerts } from './alerts'
import { orgDb, prisma } from './db'
import { monthlyizedCents, runDetection } from './engine'
import type { DetectedSubscription } from './engine'

export interface PipelineResult {
  subscriptionCount: number
  openFlagCount: number
  totalMonthlySpendCents: number
  totalFlaggedSavingsCents: number
}

/**
 * Re-run detection over ALL of an org's transactions and reconcile the
 * results into Subscription / SubscriptionCharge / Flag rows, then write
 * an AuditReport snapshot. Called after every import (CSV, Plaid sync)
 * and by the seed. Idempotent: running twice changes nothing.
 *
 * Reconciliation rules:
 *  - detected subscription matches an existing row on merchant + cadence
 *    with amounts within 30% (closest wins) — so a price hike updates the
 *    row instead of spawning a twin
 *  - flags are diffed by (subscriptionId, dedupeKey): DISMISSED/RESOLVED
 *    flags are never resurrected, OPEN flags get refreshed copy
 */
export interface PipelineOptions {
  /** Send instant PRICE_HIKE/TRIAL_CONVERTED emails for newly created flags. */
  sendAlerts?: boolean
}

export async function runPipelineForOrg(
  orgId: string,
  now: Date = new Date(),
  options: PipelineOptions = {},
): Promise<PipelineResult> {
  const db = orgDb(orgId)

  const transactions = await db.transaction.findMany({ orderBy: { date: 'asc' } })
  const existingSubs = await db.subscription.findMany()
  const confirmedMerchants = new Set(
    existingSubs.filter((s) => s.confirmedInUseAt !== null).map((s) => s.merchantName),
  )

  const detection = runDetection(
    transactions.map((t) => ({
      id: t.id,
      date: t.date,
      amountCents: t.amountCents,
      rawDescription: t.rawDescription,
    })),
    { now, confirmedMerchants },
  )

  // ── Reconcile subscriptions ──
  const detectedKeyToDbId = new Map<string, string>()
  const claimedDbIds = new Set<string>()

  for (const det of detection.subscriptions) {
    const match = existingSubs
      .filter(
        (s) =>
          !claimedDbIds.has(s.id) &&
          s.merchantName === det.merchant &&
          s.cadence === det.cadence &&
          Math.abs(s.currentAmountCents - det.currentAmountCents) /
            Math.max(s.currentAmountCents, 1) <=
            0.3,
      )
      .sort(
        (a, b) =>
          Math.abs(a.currentAmountCents - det.currentAmountCents) -
          Math.abs(b.currentAmountCents - det.currentAmountCents),
      )[0]

    const data = {
      merchantName: det.merchant,
      logoDomain: det.logoDomain ?? null,
      cadence: det.cadence,
      currentAmountCents: det.currentAmountCents,
      firstSeen: det.firstSeen,
      lastSeen: det.lastSeen,
      category: det.category ?? null,
      confidence: det.confidence,
    }

    let dbId: string
    if (match) {
      claimedDbIds.add(match.id)
      await prisma.subscription.update({ where: { id: match.id }, data })
      dbId = match.id
    } else {
      const created = await db.subscription.create({ data: data as never })
      dbId = created.id
    }
    detectedKeyToDbId.set(det.key, dbId)
    claimedDbIds.add(dbId)

    await prisma.subscriptionCharge.deleteMany({ where: { subscriptionId: dbId } })
    await prisma.subscriptionCharge.createMany({
      data: det.charges.map((c) => ({ subscriptionId: dbId, transactionId: c.id })),
      skipDuplicates: true,
    })
  }

  // ── Reconcile flags ──
  const createdFlags: Array<Flag & { merchantName: string }> = []
  for (const flag of detection.flags) {
    const subscriptionId = detectedKeyToDbId.get(flag.subscriptionKey)
    if (!subscriptionId) continue

    const existing = await prisma.flag.findUnique({
      where: { subscriptionId_dedupeKey: { subscriptionId, dedupeKey: flag.dedupeKey } },
    })
    if (existing) {
      if (existing.status === 'OPEN') {
        await prisma.flag.update({
          where: { id: existing.id },
          data: {
            severity: flag.severity as FlagSeverity,
            explanation: flag.explanation,
            estimatedAnnualSavingsCents: flag.estimatedAnnualSavingsCents,
          },
        })
      }
      // DISMISSED / RESOLVED: the user has spoken — leave it alone.
    } else {
      const created = await prisma.flag.create({
        data: {
          subscriptionId,
          type: flag.type as FlagType,
          severity: flag.severity as FlagSeverity,
          explanation: flag.explanation,
          estimatedAnnualSavingsCents: flag.estimatedAnnualSavingsCents,
          dedupeKey: flag.dedupeKey,
        },
        include: { subscription: { select: { merchantName: true } } },
      })
      createdFlags.push({ ...created, merchantName: created.subscription.merchantName })
    }
  }

  if (options.sendAlerts && createdFlags.length > 0) {
    // Alert failures must never fail an import.
    try {
      await sendInstantFlagAlerts(orgId, createdFlags)
    } catch (error) {
      console.error('[zombly] instant alert send failed', error)
    }
  }

  // Stale cleanup: an OPEN flag the engine no longer produces (e.g. a
  // zombie whose merchant was just confirmed in review) silently closes.
  // User decisions (DISMISSED/RESOLVED) are never touched.
  const detectedFlagKeys = new Set(
    detection.flags
      .map((f) => {
        const subId = detectedKeyToDbId.get(f.subscriptionKey)
        return subId ? `${subId}|${f.dedupeKey}` : null
      })
      .filter((k): k is string => k !== null),
  )
  const staleOpen = await prisma.flag.findMany({
    where: { status: 'OPEN', subscription: { orgId } },
    select: { id: true, subscriptionId: true, dedupeKey: true },
  })
  const staleIds = staleOpen
    .filter((f) => !detectedFlagKeys.has(`${f.subscriptionId}|${f.dedupeKey}`))
    .map((f) => f.id)
  if (staleIds.length > 0) {
    // DELETE, not mark DISMISSED: these are engine-suppressed flags the
    // user never touched. DISMISSED is reserved for the user's own "we
    // use it" decision, and the reconcile loop treats it as final — so
    // tombstoning here would permanently hide a flag that later
    // legitimately reappears (e.g. a paused zombie that resumes billing).
    await prisma.flag.deleteMany({ where: { id: { in: staleIds } } })
  }

  // ── Roll statuses + report ──
  const openFlags = await prisma.flag.findMany({
    where: { status: 'OPEN', subscription: { orgId } },
    select: { subscriptionId: true, estimatedAnnualSavingsCents: true },
  })
  const flaggedSubIds = new Set(openFlags.map((f) => f.subscriptionId))

  const reconciledIds = [...detectedKeyToDbId.values()]
  await prisma.subscription.updateMany({
    where: { id: { in: reconciledIds.filter((id) => flaggedSubIds.has(id)) }, status: 'ACTIVE' },
    data: { status: 'FLAGGED' },
  })
  await prisma.subscription.updateMany({
    where: { id: { in: reconciledIds.filter((id) => !flaggedSubIds.has(id)) }, status: 'FLAGGED' },
    data: { status: 'ACTIVE' },
  })

  // Retire ghosts: an existing subscription the engine produced NOTHING
  // for this run is stale — its charges were re-attributed to a different
  // detected subscription (e.g. a >30% price hike merged its clusters
  // under a new key). Without this it lingers ACTIVE forever, double-
  // counting the merchant on the dashboard and in the digest. User-set
  // CANCELED/IGNORED states are left alone.
  const reconciledIdSet = new Set(reconciledIds)
  const orphanIds = existingSubs
    .filter((s) => !reconciledIdSet.has(s.id) && (s.status === 'ACTIVE' || s.status === 'FLAGGED'))
    .map((s) => s.id)
  if (orphanIds.length > 0) {
    await prisma.subscription.updateMany({
      where: { id: { in: orphanIds } },
      data: { status: 'CANCELED' },
    })
  }

  const activeDetected = detection.subscriptions.filter((s) => s.active)
  const totalMonthlySpendCents = activeDetected.reduce(
    (sum, s) => sum + monthlyizedCents(s),
    0,
  )
  const totalFlaggedSavingsCents = openFlags.reduce(
    (sum, f) => sum + f.estimatedAnnualSavingsCents,
    0,
  )

  const snapshot: Prisma.InputJsonValue = {
    generatedAt: now.toISOString(),
    transactionCount: transactions.length,
    subscriptionCount: detection.subscriptions.length,
    activeSubscriptionCount: activeDetected.length,
    openFlagCount: openFlags.length,
    flagTypeCounts: countBy(detection.flags.map((f) => f.type)),
    topCategories: topCategories(activeDetected),
  }

  await db.auditReport.create({
    data: { totalMonthlySpendCents, totalFlaggedSavingsCents, snapshot } as never,
  })

  return {
    subscriptionCount: detection.subscriptions.length,
    openFlagCount: openFlags.length,
    totalMonthlySpendCents,
    totalFlaggedSavingsCents,
  }
}

function countBy(values: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const v of values) out[v] = (out[v] ?? 0) + 1
  return out
}

function topCategories(
  subs: DetectedSubscription[],
): Array<{ category: string; monthlyCents: number }> {
  const totals = new Map<string, number>()
  for (const sub of subs) {
    const category = sub.category ?? 'other'
    totals.set(category, (totals.get(category) ?? 0) + monthlyizedCents(sub))
  }
  return [...totals.entries()]
    .map(([category, monthlyCents]) => ({ category, monthlyCents }))
    .sort((a, b) => b.monthlyCents - a.monthlyCents)
}
