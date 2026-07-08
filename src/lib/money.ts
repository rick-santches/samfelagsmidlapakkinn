/**
 * All money in Zombly is integer cents (USD unless stated otherwise).
 * These helpers are the only place cents become display strings.
 */

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const usdWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** 1599 → "$15.99" */
export function formatMoney(cents: number): string {
  return usd.format(cents / 100)
}

/** 219900 → "$2,199" — for big hero numbers */
export function formatMoneyWhole(cents: number): string {
  return usdWhole.format(Math.round(cents / 100))
}

/** Parse a statement amount string ("1,234.56", "$12.00", "(45.00)") into cents. */
export function parseAmountToCents(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const negative = /^\(.*\)$/.test(trimmed) || trimmed.startsWith('-')
  const cleaned = trimmed.replace(/[($)]/g, '').replace(/[,\s]/g, '').replace(/^-/, '')
  if (!/^\d*\.?\d+$/.test(cleaned)) return null
  const cents = Math.round(parseFloat(cleaned) * 100)
  if (!Number.isFinite(cents)) return null
  return negative ? -cents : cents
}
