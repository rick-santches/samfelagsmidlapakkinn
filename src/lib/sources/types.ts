/**
 * Source adapter contract. Every ingestion path — CSV upload today,
 * Plaid sync and email receipts later — produces the same normalized
 * transaction shape, and the detection engine only ever sees this.
 * Positive amountCents = money spent; negative = credit/refund
 * (ignored by detection, kept for the record).
 */
export interface NormalizedTransaction {
  date: Date
  amountCents: number
  currency: string
  rawDescription: string
}

export interface ParsedStatement {
  transactions: NormalizedTransaction[]
  /** Row-level problems, reported but non-fatal (row skipped). */
  errors: Array<{ row: number; reason: string }>
}
