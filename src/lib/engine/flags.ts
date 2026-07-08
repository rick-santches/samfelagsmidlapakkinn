import { categoryNoun } from '../category-label'
import { formatMoney } from '../money'
import { annualizedCents, monthlyizedCents } from './recurrence'
import type {
  DetectedFlag,
  DetectedSubscription,
  EngineSeverity,
  EngineTransaction,
} from './types'

const DAY_MS = 86_400_000

/** Categories where paying for two tools at once is almost always waste. */
const OVERLAP_ELIGIBLE = new Set([
  'video-conferencing',
  'storage',
  'design',
  'project-mgmt',
  'crm',
  'email-marketing',
  'accounting',
  'ai-tools',
  'hosting',
  'monitoring',
  'hr',
  'security',
])

function severityFromAnnual(cents: number): EngineSeverity {
  if (cents >= 50_000) return 'HIGH'
  if (cents >= 15_000) return 'MEDIUM'
  return 'LOW'
}

function cadenceNoun(sub: DetectedSubscription): string {
  switch (sub.cadence) {
    case 'WEEKLY':
      return '/wk'
    case 'MONTHLY':
      return '/mo'
    case 'QUARTERLY':
      return '/qtr'
    case 'ANNUAL':
      return '/yr'
    case 'IRREGULAR':
      return '/mo avg'
  }
}

function priceTag(sub: DetectedSubscription): string {
  const cents =
    sub.cadence === 'IRREGULAR' ? monthlyizedCents(sub) : sub.currentAmountCents
  return `${formatMoney(cents)}${cadenceNoun(sub)}`
}

function monthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })
}

function monthsBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / DAY_MS / 30.4)
}

interface FlagContext {
  now: Date
  confirmedMerchants: ReadonlySet<string>
  merchantCharges: ReadonlyMap<string, EngineTransaction[]>
}

// ── DUPLICATE: same merchant, two live plans at once ──
function findDuplicates(subs: DetectedSubscription[]): DetectedFlag[] {
  const flags: DetectedFlag[] = []
  const byMerchant = new Map<string, DetectedSubscription[]>()
  for (const sub of subs) {
    if (!sub.active) continue
    const list = byMerchant.get(sub.merchant) ?? []
    list.push(sub)
    byMerchant.set(sub.merchant, list)
  }

  for (const [merchant, group] of byMerchant) {
    if (group.length < 2) continue
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]
        const b = group[j]
        if (!a || !b) continue
        // overlapping periods
        if (a.firstSeen > b.lastSeen || b.firstSeen > a.lastSeen) continue
        const cheaper = monthlyizedCents(a) <= monthlyizedCents(b) ? a : b
        const pricier = cheaper === a ? b : a
        const savings = annualizedCents(cheaper)
        flags.push({
          subscriptionKey: cheaper.key,
          type: 'DUPLICATE',
          severity: severityFromAnnual(savings),
          explanation: `You're paying ${merchant} twice — ${priceTag(pricier)} and ${priceTag(cheaper)} are both billing right now. Unless you meant to run two plans, merge them and save ~${formatMoney(savings)}/yr.`,
          estimatedAnnualSavingsCents: savings,
          dedupeKey: `DUPLICATE:${pricier.key}`,
        })
      }
    }
  }
  return flags
}

// ── OVERLAP: two live tools doing the same job ──
function findOverlaps(
  subs: DetectedSubscription[],
  ctx: FlagContext,
): DetectedFlag[] {
  const flags: DetectedFlag[] = []
  const byCategory = new Map<string, DetectedSubscription[]>()
  for (const sub of subs) {
    if (!sub.active || !sub.category) continue
    if (!OVERLAP_ELIGIBLE.has(sub.category)) continue
    const list = byCategory.get(sub.category) ?? []
    list.push(sub)
    byCategory.set(sub.category, list)
  }

  for (const group of byCategory.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]
        const b = group[j]
        if (!a || !b || a.merchant === b.merchant) continue
        const aConfirmed = ctx.confirmedMerchants.has(a.merchant)
        const bConfirmed = ctx.confirmedMerchants.has(b.merchant)
        // If the team has explicitly said "we use both", don't nag.
        if (aConfirmed && bConfirmed) continue
        // Flag the one to kill: the unconfirmed one, or the cheaper if both unconfirmed.
        const target = aConfirmed
          ? b
          : bConfirmed
            ? a
            : monthlyizedCents(a) <= monthlyizedCents(b)
              ? a
              : b
        const keeper = target === a ? b : a
        const savings = annualizedCents(target)
        flags.push({
          subscriptionKey: target.key,
          type: 'OVERLAP',
          severity: severityFromAnnual(savings),
          explanation: `You're paying for both ${keeper.merchant} (${priceTag(keeper)}) and ${target.merchant} (${priceTag(target)}) — that's two ${categoryNoun(a.category)} doing one job. Pick one and save ~${formatMoney(savings)}/yr.`,
          estimatedAnnualSavingsCents: savings,
          dedupeKey: `OVERLAP:${keeper.merchant}`,
        })
      }
    }
  }
  return flags
}

// ── ZOMBIE: months of quiet billing, never confirmed in review ──
function findZombies(
  subs: DetectedSubscription[],
  ctx: FlagContext,
): DetectedFlag[] {
  const flags: DetectedFlag[] = []
  for (const sub of subs) {
    if (!sub.active) continue
    if (ctx.confirmedMerchants.has(sub.merchant)) continue
    const monthsActive = monthsBetween(sub.firstSeen, ctx.now)
    if (monthsActive < 6) continue
    const savings = annualizedCents(sub)
    flags.push({
      subscriptionKey: sub.key,
      type: 'ZOMBIE',
      severity: severityFromAnnual(savings),
      explanation: `${sub.merchant} has been eating ${priceTag(sub)} since ${monthName(sub.firstSeen)} — ${monthsActive} months and nobody's confirmed anyone still uses it. Kill it or claim it: that's ${formatMoney(savings)}/yr on the line.`,
      estimatedAnnualSavingsCents: savings,
      dedupeKey: 'ZOMBIE',
    })
  }
  return flags
}

// ── PRICE_HIKE: same subscription, amount up >8% between charges ──
function findPriceHikes(subs: DetectedSubscription[]): DetectedFlag[] {
  const flags: DetectedFlag[] = []
  for (const sub of subs) {
    // Usage billing moves every cycle — that's consumption, not a hike.
    if (sub.variableAmount) continue
    for (let i = 1; i < sub.charges.length; i++) {
      const prev = sub.charges[i - 1]
      const curr = sub.charges[i]
      if (!prev || !curr || prev.amountCents <= 0) continue
      const increase = (curr.amountCents - prev.amountCents) / prev.amountCents
      // >8% and at least a dollar, so tiny bases don't cry wolf
      if (increase <= 0.08 || curr.amountCents - prev.amountCents < 100) continue
      const periodsPerYear =
        sub.cadence === 'WEEKLY' ? 52 : sub.cadence === 'MONTHLY' ? 12 : sub.cadence === 'QUARTERLY' ? 4 : sub.cadence === 'ANNUAL' ? 1 : 12
      const savings = (curr.amountCents - prev.amountCents) * periodsPerYear
      flags.push({
        subscriptionKey: sub.key,
        type: 'PRICE_HIKE',
        severity: severityFromAnnual(savings),
        explanation: `${sub.merchant} quietly raised its price ${Math.round(increase * 100)}% — ${formatMoney(prev.amountCents)} → ${formatMoney(curr.amountCents)} in ${monthName(curr.date)}. That's ${formatMoney(savings)}/yr extra unless you renegotiate or downgrade.`,
        estimatedAnnualSavingsCents: savings,
        dedupeKey: `PRICE_HIKE:${prev.amountCents}:${curr.amountCents}`,
      })
    }
  }
  return flags
}

// ── TRIAL_CONVERTED: a $0/$1 charge, then real money ──
function findTrialConversions(
  subs: DetectedSubscription[],
  ctx: FlagContext,
): DetectedFlag[] {
  const flags: DetectedFlag[] = []
  for (const sub of subs) {
    const first = sub.charges[0]
    if (!first) continue
    const all = ctx.merchantCharges.get(sub.merchant) ?? []
    const trial = all.find(
      (tx) =>
        tx.amountCents >= 0 &&
        tx.amountCents <= 100 &&
        tx.date < first.date &&
        (first.date.getTime() - tx.date.getTime()) / DAY_MS <= 60,
    )
    if (!trial) continue
    const savings = annualizedCents(sub)
    flags.push({
      subscriptionKey: sub.key,
      type: 'TRIAL_CONVERTED',
      severity: 'MEDIUM',
      explanation: `That ${formatMoney(trial.amountCents)} ${sub.merchant} trial from ${monthName(trial.date)}? It grew up into a ${priceTag(sub)} subscription. If nobody chose to keep it, cancel and save ${formatMoney(savings)}/yr.`,
      estimatedAnnualSavingsCents: savings,
      dedupeKey: 'TRIAL_CONVERTED',
    })
  }
  return flags
}

// ── FORGOTTEN_ANNUAL: a yearly charge about to auto-renew ──
function findForgottenAnnuals(
  subs: DetectedSubscription[],
  ctx: FlagContext,
): DetectedFlag[] {
  const flags: DetectedFlag[] = []
  for (const sub of subs) {
    if (sub.cadence !== 'ANNUAL' || !sub.active) continue
    const renewal = new Date(sub.lastSeen.getTime() + 365 * DAY_MS)
    const daysToRenewal = Math.round((renewal.getTime() - ctx.now.getTime()) / DAY_MS)
    if (daysToRenewal < 0 || daysToRenewal > 30) continue
    const savings = sub.currentAmountCents
    flags.push({
      subscriptionKey: sub.key,
      type: 'FORGOTTEN_ANNUAL',
      severity: severityFromAnnual(savings),
      explanation: `${sub.merchant} auto-renews for ${formatMoney(sub.currentAmountCents)} in ${daysToRenewal} day${daysToRenewal === 1 ? '' : 's'}. Annual renewals are where zombie money hides — decide now, not after the charge lands.`,
      estimatedAnnualSavingsCents: savings,
      dedupeKey: `FORGOTTEN_ANNUAL:${sub.lastSeen.toISOString().slice(0, 10)}`,
    })
  }
  return flags
}

/** Run every flag rule over the detected subscriptions. */
export function detectFlags(
  subs: DetectedSubscription[],
  ctx: FlagContext,
): DetectedFlag[] {
  return [
    ...findDuplicates(subs),
    ...findOverlaps(subs, ctx),
    ...findZombies(subs, ctx),
    ...findPriceHikes(subs),
    ...findTrialConversions(subs, ctx),
    ...findForgottenAnnuals(subs, ctx),
  ]
}
