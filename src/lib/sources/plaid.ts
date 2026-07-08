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
  const collected: PlaidTransaction[] = []
  const removed: RemovedTransaction[] = []

  let hasMore = true
  while (hasMore) {
    const response = await client.transactionsSync({
      access_token: accessToken,
      cursor,
      count: 500,
    })
    collected.push(...response.data.added, ...response.data.modified)
    removed.push(...response.data.removed)
    cursor = response.data.next_cursor
    hasMore = response.data.has_more
  }

  const normalized = collected
    .map(plaidToNormalized)
    .filter((tx): tx is NormalizedTransaction => tx !== null)

  const inserted = await prisma.transaction.createMany({
    data: normalized.map((tx) => {
      const norm = normalizeMerchant(tx.rawDescription)
      return {
        orgId: source.orgId,
        sourceId: source.id,
        date: tx.date,
        amountCents: tx.amountCents,
        currency: tx.currency,
        rawDescription: tx.rawDescription,
        normalizedMerchant: norm.merchant,
        category: norm.category ?? null,
        hash: transactionHash(source.orgId, tx.date, tx.amountCents, tx.rawDescription),
      }
    }),
    skipDuplicates: true,
  })

  await prisma.connectedSource.update({
    where: { id: source.id },
    data: { plaidCursor: cursor ?? null, lastSyncedAt: new Date(), status: 'ACTIVE' },
  })

  return { added: inserted.count, fetched: normalized.length }
}
