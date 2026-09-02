import { matchMerchant } from './merchants'
import type { NormalizedMerchant } from './types'

/** Payment-processor prefixes that carry no merchant information. */
const PROCESSOR_PREFIXES = [
  /^SQ \*/,
  /^SQU\*/,
  /^TST\* ?/,
  /^PAYPAL \*/,
  /^PP\*/,
  /^PAYPAL\*/,
  /^CKE\*/,
  /^IN \*/,
  /^SP \*/,
  /^EB \*/,
  /^PY \*/,
  /^POS /,
  /^DEBIT (CARD )?PURCHASE -? ?/,
  /^ACH (DEBIT|PAYMENT) -? ?/,
  /^RECURRING PAYMENT -? ?/,
  /^CHECKCARD \d* ?/,
]

const US_STATES =
  'AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC'

/**
 * Heuristic cleanup for descriptors the dictionary doesn't know:
 * strip processor junk, phone numbers, reference codes, trailing
 * city/state, then title-case what's left.
 */
export function heuristicClean(raw: string): string {
  let s = raw.toUpperCase().trim()

  for (const prefix of PROCESSOR_PREFIXES) s = s.replace(prefix, '')

  s = s
    // phone numbers: 888-636-6145, 8886366145, 888.636.6145
    .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, ' ')
    .replace(/\b8\d{9}\b/g, ' ')
    // long reference / invoice codes
    .replace(/\b[A-Z]*\d[A-Z0-9]{5,}\b/g, ' ')
    // store numbers: #1123
    .replace(/#\s?\d+/g, ' ')
    // trailing "CITY ST" / lone state code (single-word city only, so
    // business names don't get eaten)
    .replace(new RegExp(`\\s+[A-Z.]+\\s+(${US_STATES})\\s*$`), ' ')
    .replace(new RegExp(`\\s+(${US_STATES})\\s*$`), ' ')
    // descriptor separators and leftovers
    .replace(/[*|~_]+/g, ' ')
    // domain suffixes read better without TLD noise
    .replace(/\.(COM|NET|ORG|IO|CO|US|AI)\b/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (s === '') s = raw.toUpperCase().trim()

  // Title-case, keeping short all-caps tokens (AWS, ADP) as-is
  return s
    .split(' ')
    .map((word) =>
      word.length <= 3 ? word : word.charAt(0) + word.slice(1).toLowerCase(),
    )
    .join(' ')
}

/**
 * Normalize a raw bank descriptor into a canonical merchant.
 * Dictionary first ("GITHUB* INC 8886366145" → GitHub, github.com,
 * dev-tools); heuristic cleanup for unknowns.
 */
export function normalizeMerchant(rawDescription: string): NormalizedMerchant {
  const upper = rawDescription.toUpperCase()
  const entry = matchMerchant(upper)
  if (entry) {
    return {
      merchant: entry.name,
      domain: entry.domain,
      category: entry.category,
      matched: true,
      commonlyForgotten: entry.commonlyForgotten ?? false,
    }
  }
  return {
    merchant: heuristicClean(rawDescription),
    matched: false,
    commonlyForgotten: false,
  }
}
