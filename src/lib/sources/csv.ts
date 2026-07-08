import { z } from 'zod'
import { parseAmountToCents } from '../money'
import type { NormalizedTransaction, ParsedStatement } from './types'

/**
 * CSV statement parsing: bank-format auto-detection, column mapping,
 * and row → NormalizedTransaction conversion. Pure module — the browser
 * uses it to suggest a mapping and preview, the API re-runs it as the
 * source of truth.
 */

export const AMOUNT_CONVENTIONS = ['NEGATIVE_IS_CHARGE', 'POSITIVE_IS_CHARGE'] as const
export type AmountConvention = (typeof AMOUNT_CONVENTIONS)[number]

export const ColumnMappingSchema = z.object({
  dateColumn: z.string().min(1),
  descriptionColumn: z.string().min(1),
  amountColumn: z.string().min(1),
  amountConvention: z.enum(AMOUNT_CONVENTIONS),
})
export type ColumnMapping = z.infer<typeof ColumnMappingSchema>

export type CsvRow = Record<string, string | null | undefined>

interface BankFormat {
  id: string
  label: string
  /** Headers that must ALL be present (case-insensitive) to match. */
  signature: string[]
  mapping: ColumnMapping
}

/** Export formats of the banks/cards US small businesses actually use. */
export const BANK_FORMATS: readonly BankFormat[] = [
  {
    id: 'chase-card',
    label: 'Chase Credit Card',
    signature: ['transaction date', 'post date', 'description', 'amount'],
    mapping: {
      dateColumn: 'Transaction Date',
      descriptionColumn: 'Description',
      amountColumn: 'Amount',
      amountConvention: 'NEGATIVE_IS_CHARGE',
    },
  },
  {
    id: 'boa',
    label: 'Bank of America',
    signature: ['date', 'description', 'amount', 'running bal.'],
    mapping: {
      dateColumn: 'Date',
      descriptionColumn: 'Description',
      amountColumn: 'Amount',
      amountConvention: 'NEGATIVE_IS_CHARGE',
    },
  },
  {
    id: 'mercury',
    label: 'Mercury',
    signature: ['date (utc)', 'description', 'amount'],
    mapping: {
      dateColumn: 'Date (UTC)',
      descriptionColumn: 'Description',
      amountColumn: 'Amount',
      amountConvention: 'NEGATIVE_IS_CHARGE',
    },
  },
  {
    id: 'brex',
    label: 'Brex',
    signature: ['purchase date', 'merchant name', 'amount'],
    mapping: {
      dateColumn: 'Purchase Date',
      descriptionColumn: 'Merchant Name',
      amountColumn: 'Amount',
      amountConvention: 'POSITIVE_IS_CHARGE',
    },
  },
  {
    id: 'ramp',
    label: 'Ramp',
    signature: ['transaction date', 'merchant name', 'amount'],
    mapping: {
      dateColumn: 'Transaction Date',
      descriptionColumn: 'Merchant Name',
      amountColumn: 'Amount',
      amountConvention: 'POSITIVE_IS_CHARGE',
    },
  },
  // Amex last: its three-header signature is a subset of several others.
  {
    id: 'amex',
    label: 'American Express',
    signature: ['date', 'description', 'amount'],
    mapping: {
      dateColumn: 'Date',
      descriptionColumn: 'Description',
      amountColumn: 'Amount',
      amountConvention: 'POSITIVE_IS_CHARGE',
    },
  },
]

/** Match uploaded headers against known bank export formats. */
export function detectBankFormat(headers: string[]): BankFormat | null {
  const lower = new Set(headers.map((h) => h.trim().toLowerCase()))
  for (const format of BANK_FORMATS) {
    if (format.signature.every((sig) => lower.has(sig))) return format
  }
  return null
}

/** Best-effort mapping suggestion when no bank format matches. */
export function suggestMapping(headers: string[]): ColumnMapping | null {
  const find = (...candidates: string[]): string | undefined =>
    headers.find((h) => candidates.includes(h.trim().toLowerCase()))

  const dateColumn = find('date', 'transaction date', 'posted date', 'post date', 'date (utc)', 'purchase date')
  const descriptionColumn = find('description', 'merchant name', 'merchant', 'payee', 'name', 'details', 'memo')
  const amountColumn = find('amount', 'amount (usd)', 'debit', 'transaction amount')

  if (!dateColumn || !descriptionColumn || !amountColumn) return null
  return {
    dateColumn,
    descriptionColumn,
    amountColumn,
    amountConvention: 'NEGATIVE_IS_CHARGE',
  }
}

/** Parse "MM/DD/YYYY", "YYYY-MM-DD", "M/D/YY" into a UTC date. */
export function parseStatementDate(raw: string): Date | null {
  const s = raw.trim()

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (iso) {
    const [, y, mo, d] = iso
    const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(s)
  if (us) {
    const [, mo, d, yRaw] = us
    const y = Number(yRaw!.length === 2 ? `20${yRaw}` : yRaw)
    const month = Number(mo)
    const day = Number(d)
    if (month < 1 || month > 12 || day < 1 || day > 31) return null
    const date = new Date(Date.UTC(y, month - 1, day))
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

/**
 * Convert raw CSV rows into normalized transactions using a column
 * mapping. Charges come out positive regardless of the bank's sign
 * convention; credits/refunds come out negative. Bad rows are skipped
 * and reported.
 */
export function parseStatementRows(
  rows: CsvRow[],
  mapping: ColumnMapping,
): ParsedStatement {
  const transactions: NormalizedTransaction[] = []
  const errors: ParsedStatement['errors'] = []

  rows.forEach((row, index) => {
    const rawDate = row[mapping.dateColumn]
    const rawDescription = row[mapping.descriptionColumn]
    const rawAmount = row[mapping.amountColumn]

    if (!rawDate || !rawDescription || !rawAmount) {
      errors.push({ row: index + 1, reason: 'missing date, description, or amount' })
      return
    }

    const date = parseStatementDate(rawDate)
    if (!date) {
      errors.push({ row: index + 1, reason: `unrecognized date "${rawDate}"` })
      return
    }

    const cents = parseAmountToCents(rawAmount)
    if (cents === null) {
      errors.push({ row: index + 1, reason: `unparseable amount "${rawAmount}"` })
      return
    }
    // $0 rows are kept (real trial/verification lines) — they carry no
    // spend and never form a subscription, but the trial detector reads
    // them. parseAmountToCents already rejected non-numeric junk as null.

    const amountCents =
      mapping.amountConvention === 'NEGATIVE_IS_CHARGE' ? -cents : cents

    transactions.push({
      date,
      amountCents,
      currency: 'USD',
      rawDescription: rawDescription.trim().slice(0, 300),
    })
  })

  return { transactions, errors }
}
