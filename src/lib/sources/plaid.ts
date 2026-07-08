import type { Transaction as PlaidTransaction, RemovedTransaction } from 'plaid'
import { decryptSecret } from '../crypto'
import { prisma } from '../db'
import { normalizeMerchant } from '../engine'
import { transactionHash } from '../hash'
import { plaid } from '../plaid'
import type { NormalizedTransaction } from './types'

/**
 * Plaid adapter: transactionsSync → the same NormalizedTransaction
 * shape the CSV path produces. The detection engine cannot tell the
 * difference — that's the point.
 *
 * Plaid sign convention: positive amount = money leaving the account,
 * which matches ours exactly.
 */
export function plaidToNormalized(tx: PlaidTransaction): NormalizedTransaction | null {
  if (tx.pending) return null
  const amountCents = Math.round(tx.amount * 100)
  if (!Number.isFinite(amountCents) || amountCents === 0) return null
  const rawDescription = (tx.merchant_name || tx.name || 'UNKNOWN').slice(0, 300)
  return {
    date: new Date(`${tx.date}T00:00:00Z`),
    amountCents,
    currency: tx.iso_currency_code ?? 'USD',
    rawDescription,
  }
}

export interface PlaidSyncResult {
  added: number
  fetched: number
}

/**
 * Pull new transactions for a PLAID source via transactionsSync and
 * insert them idempotently (same orgId+hash dedup as CSV imports).
 * Persists the cursor so each sync is incremental.
 */
export async function syncPlaidSource(sourceId: string): Promise<PlaidSyncResult> {
  const client = plaid()
  if (!client) throw new Error('Plaid is not configured')

  const source = await prisma.connectedSource.findUniqueOrThrow({
    where: { id: sourceId },
  })
  if (source.type !== 'PLAID' || !source.plaidAccessToken) {
    throw new Error('Not a Plaid source')
  }

  const accessToken = decryptSecret(source.plaidAccessToken)
  let cursor = source.plaidCursor ?? undefined
  // added + modified both need to land in the DB as the current version;
  // modified must REPLACE its prior row (bank revised amount/date/desc),
  // so we key on Plaid's transaction_id, not on our content hash.
  const upserted: PlaidTransaction[] = []
  const removedIds: string[] = []

  let hasMore = true
  while (hasMore) {
    const response = await client.transactionsSync({
      access_token: accessToken,
      cursor,
      count: 500,
    })
    upserted.push(...response.data.added, ...response.data.modified)
    removedIds.push(...response.data.removed.map((r: RemovedTransaction) => r.transaction_id ?? ''))
    cursor = response.data.next_cursor
    hasMore = response.data.has_more
  }

  const rows = upserted
    .map((tx) => {
      const normalized = plaidToNormalized(tx)
      if (!normalized) return null
      const norm = normalizeMerchant(normalized.rawDescription)
      return {
        orgId: source.orgId,
        sourceId: source.id,
        date: normalized.date,
        amountCents: normalized.amountCents,
        currency: normalized.currency,
        rawDescription: normalized.rawDescription,
        normalizedMerchant: norm.merchant,
        category: norm.category ?? null,
        hash: transactionHash(
          source.orgId,
          normalized.date,
          normalized.amountCents,
          normalized.rawDescription,
        ),
        plaidTransactionId: tx.transaction_id,
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  // Every transaction_id we touched this sync: clear any prior version
  // (handles "modified") plus the explicitly "removed" ones, then insert
  // the current versions. Atomic so a partial sync can't drop rows.
  const touchedIds = [...rows.map((r) => r.plaidTransactionId), ...removedIds].filter(
    (id): id is string => id.length > 0,
  )

  const inserted = await prisma.$transaction(async (tx) => {
    if (touchedIds.length > 0) {
      await tx.transaction.deleteMany({
        where: { orgId: source.orgId, plaidTransactionId: { in: touchedIds } },
      })
    }
    const result =
      rows.length > 0
        ? await tx.transaction.createMany({ data: rows, skipDuplicates: true })
        : { count: 0 }
    return result
  })

  await prisma.connectedSource.update({
    where: { id: source.id },
    data: { plaidCursor: cursor ?? null, lastSyncedAt: new Date(), status: 'ACTIVE' },
  })

  return { added: inserted.count, fetched: rows.length }
}
