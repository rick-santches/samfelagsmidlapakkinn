import { createHash } from 'crypto'

/**
 * Stable identity for a transaction across re-uploads of the same
 * statement: sha256(orgId + date + amount + rawDescription).
 * Paired with the (orgId, hash) unique index, imports are idempotent.
 */
export function transactionHash(
  orgId: string,
  date: Date,
  amountCents: number,
  rawDescription: string,
): string {
  const day = date.toISOString().slice(0, 10)
  return createHash('sha256')
    .update(`${orgId}|${day}|${amountCents}|${rawDescription}`)
    .digest('hex')
}
