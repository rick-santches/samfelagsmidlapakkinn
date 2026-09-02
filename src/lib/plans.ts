import type { Plan } from '@prisma/client'

/**
 * Plans & limits, enforced server-side. Flat pricing on purpose — the
 * savings number is the marketing, not the billing.
 * Annual = 2 months free.
 */
export interface PlanSpec {
  name: string
  monthlyCents: number
  annualCents: number
  /** null = unlimited */
  maxSources: number | null
  flagsUnlocked: boolean
  plaidAllowed: boolean
  seats: number
  blurb: string
}

export const PLANS: Record<Plan, PlanSpec> = {
  FREE: {
    name: 'Free Audit',
    monthlyCents: 0,
    annualCents: 0,
    maxSources: 1,
    flagsUnlocked: false,
    plaidAllowed: false,
    seats: 1,
    blurb: 'Upload a statement, see your recurring spend and how much is flagged. Unlock the Kill List to see what to cancel.',
  },
  SOLO: {
    name: 'Solo',
    monthlyCents: 1900,
    annualCents: 19000,
    maxSources: 1,
    flagsUnlocked: true,
    plaidAllowed: false,
    seats: 1,
    blurb: 'One source, every flag, every explanation, email alerts.',
  },
  TEAM: {
    name: 'Team',
    monthlyCents: 4900,
    annualCents: 49000,
    maxSources: null,
    flagsUnlocked: true,
    plaidAllowed: true,
    seats: 5,
    blurb: 'Unlimited sources, Plaid bank connections, PDF reports, 5 seats.',
  },
}

export function planSpec(plan: Plan): PlanSpec {
  return PLANS[plan]
}

/** Can this org add one more connected source? */
export function canAddSource(plan: Plan, currentCount: number): boolean {
  const max = PLANS[plan].maxSources
  return max === null || currentCount < max
}
