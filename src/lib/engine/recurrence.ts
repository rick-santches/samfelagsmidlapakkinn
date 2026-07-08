import { normalizeMerchant } from './normalize'
import type {
  DetectedSubscription,
  EngineCadence,
  EngineTransaction,
} from './types'

const DAY_MS = 86_400_000

interface CadenceSpec {
  cadence: EngineCadence
  /** target interval in days */
  target: number
  /** tolerance around the target, in days */
  tolerance: number
  minCharges: number
}

// Spec tolerances: monthly ±4d, annual ±10d.
const CADENCES: readonly CadenceSpec[] = [
  { cadence: 'WEEKLY', target: 7, tolerance: 2, minCharges: 3 },
  { cadence: 'MONTHLY', target: 30.4, tolerance: 4, minCharges: 2 },
  { cadence: 'QUARTERLY', target: 91, tolerance: 10, minCharges: 2 },
  { cadence: 'ANNUAL', target: 365, tolerance: 10, minCharges: 2 },
]

/** Nominal days per billing period, for comparing cadence tightness. */
const CADENCE_DAYS: Record<EngineCadence, number> = {
  WEEKLY: 7,
  MONTHLY: 30.4,
  QUARTERLY: 91,
  ANNUAL: 365,
  IRREGULAR: 400,
}

/** How long after the expected next charge we still consider a subscription alive. */
const ACTIVE_GRACE: Record<EngineCadence, number> = {
  WEEKLY: 14,
  MONTHLY: 45,
  QUARTERLY: 135,
  ANNUAL: 400,
  IRREGULAR: 60,
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(b.getTime() - a.getTime()) / DAY_MS
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((x, y) => x - y)
  const mid = Math.floor(sorted.length / 2)
  const lower = sorted[mid - 1]
  const upper = sorted[mid]
  return sorted.length % 2 === 0 && lower !== undefined && upper !== undefined
    ? (lower + upper) / 2
    : (sorted[mid] ?? 0)
}

function intervalsOf(charges: EngineTransaction[]): number[] {
  const out: number[] = []
  for (let i = 1; i < charges.length; i++) {
    const prev = charges[i - 1]
    const curr = charges[i]
    if (prev && curr) out.push(daysBetween(prev.date, curr.date))
  }
  return out
}

function cadenceFor(intervals: number[], chargeCount: number): EngineCadence | null {
  if (intervals.length === 0) return null
  const med = median(intervals)
  for (const spec of CADENCES) {
    if (chargeCount < spec.minCharges) continue
    if (Math.abs(med - spec.target) <= spec.tolerance) return spec.cadence
  }
  // Recurring but off-pattern: only call it a subscription with enough evidence.
  if (chargeCount >= 4 && med >= 5 && med <= 400) return 'IRREGULAR'
  return null
}

/**
 * Confidence 0–1 from three signals:
 *  - interval regularity (median absolute deviation vs the median interval)
 *  - number of charges observed (4+ = full marks)
 *  - amount stability across charges
 */
function confidenceFor(
  intervals: number[],
  amounts: number[],
  cadence: EngineCadence,
): number {
  const med = median(intervals)
  const mad = median(intervals.map((i) => Math.abs(i - med)))
  const regularity = med > 0 ? Math.max(0, 1 - (mad / med) * 3) : 0

  const count = Math.min(1, (intervals.length + 1) / 4)

  const amtMed = median(amounts)
  const amtMad = median(amounts.map((a) => Math.abs(a - amtMed)))
  const stability = amtMed > 0 ? Math.max(0, 1 - (amtMad / amtMed) * 2) : 0

  const raw = 0.45 * regularity + 0.3 * count + 0.25 * stability
  const penalty = cadence === 'IRREGULAR' ? 0.85 : 1
  return Math.round(raw * penalty * 100) / 100
}

/**
 * Group one merchant's charges into amount clusters so that two
 * concurrently-running plans (two Dropbox accounts) stay separate,
 * while ordinary price changes (54.99 → 59.99) stay together.
 * Charges join a cluster when within ±15% of the cluster's median amount.
 */
function clusterByAmount(charges: EngineTransaction[]): EngineTransaction[][] {
  const clusters: { charges: EngineTransaction[]; amounts: number[] }[] = []
  for (const tx of charges) {
    let best: { cluster: (typeof clusters)[number]; dist: number } | null = null
    for (const cluster of clusters) {
      const med = median(cluster.amounts)
      const dist = med > 0 ? Math.abs(tx.amountCents - med) / med : 1
      if (dist <= 0.15 && (best === null || dist < best.dist)) {
        best = { cluster, dist }
      }
    }
    if (best) {
      best.cluster.charges.push(tx)
      best.cluster.amounts.push(tx.amountCents)
    } else {
      clusters.push({ charges: [tx], amounts: [tx.amountCents] })
    }
  }
  return clusters.map((c) => c.charges)
}

function buildSubscription(
  merchant: string,
  charges: EngineTransaction[],
  now: Date,
  meta: { domain?: string; category?: DetectedSubscription['category']; commonlyForgotten: boolean },
  keySuffix: string,
  variableAmount = false,
): DetectedSubscription | null {
  const sorted = [...charges].sort((a, b) => a.date.getTime() - b.date.getTime())
  const intervals = intervalsOf(sorted)
  const cadence = cadenceFor(intervals, sorted.length)
  if (!cadence) return null

  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (!first || !last) return null

  const amounts = sorted.map((c) => c.amountCents)
  const confidence = confidenceFor(intervals, amounts, cadence)
  if (confidence < 0.3) return null

  const expectedInterval =
    CADENCES.find((c) => c.cadence === cadence)?.target ?? median(intervals)
  const active =
    daysBetween(last.date, now) <= expectedInterval + ACTIVE_GRACE[cadence]

  return {
    key: `${merchant}|${cadence}|${keySuffix}`,
    merchant,
    logoDomain: meta.domain,
    category: meta.category,
    cadence,
    currentAmountCents: last.amountCents,
    charges: sorted,
    firstSeen: first.date,
    lastSeen: last.date,
    confidence,
    commonlyForgotten: meta.commonlyForgotten,
    active,
    variableAmount,
  }
}

function mergeSequentialClusters(
  found: DetectedSubscription[],
  merchant: string,
  now: Date,
  meta: { domain?: string; category?: DetectedSubscription['category']; commonlyForgotten: boolean },
): void {
  let merged = true
  while (merged && found.length > 1) {
    merged = false
    found.sort((a, b) => a.firstSeen.getTime() - b.firstSeen.getTime())
    for (let i = 0; i < found.length - 1; i++) {
      const a = found[i]
      const b = found[i + 1]
      if (!a || !b || a.cadence !== b.cadence || a.cadence === 'IRREGULAR') continue
      // b must start after a ended, within ~1.5 billing periods
      const gapDays = daysBetween(a.lastSeen, b.firstSeen)
      const sequential = b.firstSeen > a.lastSeen
      if (!sequential || gapDays > CADENCE_DAYS[a.cadence] * 1.6) continue
      const combined = buildSubscription(
        merchant,
        [...a.charges, ...b.charges],
        now,
        meta,
        `${a.key.split('|')[2] ?? ''}+${b.key.split('|')[2] ?? ''}`,
      )
      if (!combined || combined.cadence !== a.cadence) continue
      found.splice(i, 2, combined)
      merged = true
      break
    }
  }
}

export interface RecurrenceResult {
  subscriptions: DetectedSubscription[]
  /** All positive charges grouped by normalized merchant (for trial detection). */
  merchantCharges: Map<string, EngineTransaction[]>
}

/**
 * Detect subscriptions from a pile of normalized transactions:
 * group by merchant → cluster by amount → infer cadence per cluster.
 * If a merchant's clusters individually fail but the merchant's dates
 * clearly recur (AWS-style variable bills), fall back to one
 * variable-amount subscription across all of its charges.
 */
export function detectRecurrences(
  transactions: EngineTransaction[],
  now: Date,
): RecurrenceResult {
  const byMerchant = new Map<
    string,
    { charges: EngineTransaction[]; domain?: string; category?: DetectedSubscription['category']; commonlyForgotten: boolean }
  >()

  for (const tx of transactions) {
    if (tx.amountCents <= 0) continue
    const norm = normalizeMerchant(tx.rawDescription)
    const group = byMerchant.get(norm.merchant)
    if (group) {
      group.charges.push(tx)
    } else {
      byMerchant.set(norm.merchant, {
        charges: [tx],
        domain: norm.domain,
        category: norm.category,
        commonlyForgotten: norm.commonlyForgotten,
      })
    }
  }

  const subscriptions: DetectedSubscription[] = []
  const merchantCharges = new Map<string, EngineTransaction[]>()

  for (const [merchant, group] of byMerchant) {
    merchantCharges.set(
      merchant,
      [...group.charges].sort((a, b) => a.date.getTime() - b.date.getTime()),
    )

    const meta = {
      domain: group.domain,
      category: group.category,
      commonlyForgotten: group.commonlyForgotten,
    }

    const clusters = clusterByAmount(group.charges)
    const found: DetectedSubscription[] = []
    for (const cluster of clusters) {
      // Trial-sized charges ($0/$1) never form their own subscription.
      if (median(cluster.map((c) => c.amountCents)) <= 100) continue
      const sub = buildSubscription(
        merchant,
        cluster,
        now,
        meta,
        String(median(cluster.map((c) => c.amountCents))),
      )
      if (sub) found.push(sub)
    }

    // A price hike bigger than the ±15% cluster band splits one
    // subscription into two sequential clusters ($25/mo then $29/mo).
    // Sequential-in-time clusters with the same cadence are one
    // subscription that changed price; genuinely parallel plans
    // (duplicate Dropbox) interleave and never merge here.
    mergeSequentialClusters(found, merchant, now, meta)

    // Usage-billed services (AWS) recur on a clean schedule with wildly
    // varying amounts, which fragments the clusters into phantom
    // longer-cadence "plans" (every ~3rd bill lands in the same band).
    // If treating ALL the merchant's charges as one stream yields a
    // strictly tighter cadence than any cluster, the clusters were an
    // artifact — one variable-amount subscription is the truth. Two
    // genuinely parallel plans (duplicate Dropbox) interleave to a ~15-day
    // stream that matches no cadence, so they keep their clusters.
    const merged =
      group.charges.length >= 4
        ? buildSubscription(merchant, group.charges, now, meta, 'variable', true)
        : null

    // A cluster is "solid" when its cadence is at least as tight as the
    // merged stream's AND it actually shows up every period across its
    // span. A phantom cluster (every ~3rd AWS bill landing in the same
    // amount band) claims a cadence but misses most expected charges.
    const clusterIsSolid = (sub: DetectedSubscription): boolean => {
      if (!merged) return true
      if (CADENCE_DAYS[sub.cadence] > CADENCE_DAYS[merged.cadence]) return false
      const spanDays =
        (sub.lastSeen.getTime() - sub.firstSeen.getTime()) / DAY_MS
      const expected = spanDays / CADENCE_DAYS[sub.cadence] + 1
      return sub.charges.length >= expected * 0.8
    }

    const preferMerged =
      merged !== null &&
      merged.cadence !== 'IRREGULAR' &&
      !found.some(clusterIsSolid)

    if (preferMerged && merged) {
      subscriptions.push(merged)
    } else if (found.length > 0) {
      subscriptions.push(...found)
    } else if (merged) {
      subscriptions.push(merged)
    }
  }

  subscriptions.sort((a, b) => b.currentAmountCents - a.currentAmountCents)
  return { subscriptions, merchantCharges }
}

/** Normalize any cadence to an average monthly cost in cents. */
export function monthlyizedCents(sub: DetectedSubscription): number {
  switch (sub.cadence) {
    case 'WEEKLY':
      return Math.round(sub.currentAmountCents * 4.33)
    case 'MONTHLY':
      return sub.currentAmountCents
    case 'QUARTERLY':
      return Math.round(sub.currentAmountCents / 3)
    case 'ANNUAL':
      return Math.round(sub.currentAmountCents / 12)
    case 'IRREGULAR': {
      const spanDays = Math.max(
        30,
        (sub.lastSeen.getTime() - sub.firstSeen.getTime()) / DAY_MS,
      )
      const total = sub.charges.reduce((sum, c) => sum + c.amountCents, 0)
      return Math.round((total / spanDays) * 30.4)
    }
  }
}

/** Annualized cost in cents. */
export function annualizedCents(sub: DetectedSubscription): number {
  return sub.cadence === 'ANNUAL'
    ? sub.currentAmountCents
    : monthlyizedCents(sub) * 12
}
