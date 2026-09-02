/**
 * Detection engine types. This module tree (src/lib/engine) is pure
 * TypeScript with zero framework or database dependencies — it operates
 * on normalized transactions regardless of source (CSV, Plaid, email).
 */

export type Category =
  // Overlap-eligible taxonomy (two active tools in one of these = OVERLAP flag)
  | 'video-conferencing'
  | 'storage'
  | 'design'
  | 'project-mgmt'
  | 'crm'
  | 'email-marketing'
  | 'accounting'
  | 'ai-tools'
  | 'hosting'
  | 'monitoring'
  | 'hr'
  | 'security'
  // Descriptive-only categories
  | 'communication'
  | 'dev-tools'
  | 'productivity'
  | 'analytics'
  | 'marketing'
  | 'social-media'
  | 'support'
  | 'payments'
  | 'media'
  | 'education'
  | 'telecom'
  | 'shipping'
  | 'legal'
  | 'domains'
  | 'e-commerce'
  | 'other'

export type EngineCadence = 'MONTHLY' | 'ANNUAL' | 'QUARTERLY' | 'WEEKLY' | 'IRREGULAR'

export type EngineFlagType =
  | 'DUPLICATE'
  | 'OVERLAP'
  | 'ZOMBIE'
  | 'PRICE_HIKE'
  | 'TRIAL_CONVERTED'
  | 'FORGOTTEN_ANNUAL'

export type EngineSeverity = 'LOW' | 'MEDIUM' | 'HIGH'

/** The engine's input: one normalized transaction from any source. */
export interface EngineTransaction {
  id: string
  date: Date
  amountCents: number
  rawDescription: string
}

export interface NormalizedMerchant {
  /** Canonical display name ("GitHub") or heuristic cleanup of the raw descriptor. */
  merchant: string
  /** Domain for logo lookup (logo.clearbit.com/{domain}), only when dictionary-matched. */
  domain?: string
  category?: Category
  /** True when matched against the curated dictionary. */
  matched: boolean
  /** Category/merchant users habitually forget they're paying for. */
  commonlyForgotten: boolean
}

export interface DetectedSubscription {
  /** Stable identity within one engine run: merchant|cadence|amountBucket. */
  key: string
  merchant: string
  logoDomain?: string
  category?: Category
  cadence: EngineCadence
  currentAmountCents: number
  /** Date-ascending charges belonging to this subscription. */
  charges: EngineTransaction[]
  firstSeen: Date
  lastSeen: Date
  /** 0–1: interval regularity + charge count + amount stability. */
  confidence: number
  commonlyForgotten: boolean
  /** Whether the charge pattern looks alive as of `now`. */
  active: boolean
  /**
   * True for usage-billed merchants (AWS-style) whose amount changes
   * every cycle — exempt from PRICE_HIKE, which only means something
   * for fixed-price plans.
   */
  variableAmount: boolean
}

export interface DetectedFlag {
  subscriptionKey: string
  type: EngineFlagType
  severity: EngineSeverity
  /** Plain-English, sharp-friend voice. */
  explanation: string
  estimatedAnnualSavingsCents: number
  /**
   * Stable key for diffing against stored flags across re-imports, so a
   * dismissed flag stays dismissed (e.g. "PRICE_HIKE:5499:5999").
   */
  dedupeKey: string
}

export interface EngineOptions {
  /** Injected clock — engine never reads the real time. */
  now: Date
  /** Merchant names the user confirmed as "we use this" in the review flow. */
  confirmedMerchants?: ReadonlySet<string>
}

export interface EngineResult {
  subscriptions: DetectedSubscription[]
  flags: DetectedFlag[]
}
