import { detectFlags } from './flags'
import { detectRecurrences } from './recurrence'
import type { EngineOptions, EngineResult, EngineTransaction } from './types'

export { normalizeMerchant, heuristicClean } from './normalize'
export { detectRecurrences, monthlyizedCents, annualizedCents } from './recurrence'
export { detectFlags } from './flags'
export { MERCHANT_DICTIONARY, matchMerchant, logoUrl } from './merchants'
export type * from './types'

/**
 * The whole engine in one call: normalized transactions in,
 * subscriptions + flags out. Pure — same input and `now`, same output.
 */
export function runDetection(
  transactions: EngineTransaction[],
  options: EngineOptions,
): EngineResult {
  const { now, confirmedMerchants = new Set<string>() } = options
  const { subscriptions, merchantCharges } = detectRecurrences(transactions, now)
  const flags = detectFlags(subscriptions, {
    now,
    confirmedMerchants,
    merchantCharges,
  })
  return { subscriptions, flags }
}
