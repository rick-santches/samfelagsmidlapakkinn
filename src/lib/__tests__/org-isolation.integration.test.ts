import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { orgDb, prisma } from '../db'
import { transactionHash } from '../hash'

/**
 * Tenant isolation is the single most important invariant in this app:
 * one org must never read, mutate, or delete another org's financial
 * data. orgDb(orgId) is the guard that enforces it at the Prisma layer.
 * This suite proves the guard holds for every org-scoped model and every
 * operation — especially the singular update/delete/upsert that a code
 * review found were previously unscoped.
 *
 * Requires a live Postgres (DATABASE_URL). Run: npm run test:integration
 */

interface Fixture {
  orgId: string
  userId: string
  sourceId: string
  subscriptionId: string
  transactionId: string
  reportId: string
}

async function makeOrg(tag: string): Promise<Fixture> {
  const user = await prisma.user.create({
    data: { email: `iso-${tag}-${Date.now()}@example.test`, name: `User ${tag}` },
  })
  const org = await prisma.organization.create({
    data: { name: `Iso Org ${tag}`, memberships: { create: { userId: user.id, role: 'OWNER' } } },
  })
  const source = await prisma.connectedSource.create({
    data: { orgId: org.id, type: 'CSV', label: `Card ${tag}` },
  })
  const date = new Date('2026-01-15T00:00:00Z')
  const transaction = await prisma.transaction.create({
    data: {
      orgId: org.id,
      sourceId: source.id,
      date,
      amountCents: 1999,
      rawDescription: `MERCHANT ${tag}`,
      normalizedMerchant: `Merchant ${tag}`,
      hash: transactionHash(org.id, date, 1999, `MERCHANT ${tag}`),
    },
  })
  const subscription = await prisma.subscription.create({
    data: {
      orgId: org.id,
      merchantName: `Merchant ${tag}`,
      cadence: 'MONTHLY',
      currentAmountCents: 1999,
      firstSeen: date,
      lastSeen: date,
      confidence: 0.9,
    },
  })
  const report = await prisma.auditReport.create({
    data: { orgId: org.id, totalMonthlySpendCents: 1999, totalFlaggedSavingsCents: 0, snapshot: {} },
  })
  return {
    orgId: org.id,
    userId: user.id,
    sourceId: source.id,
    subscriptionId: subscription.id,
    transactionId: transaction.id,
    reportId: report.id,
  }
}

let A: Fixture
let B: Fixture

beforeAll(async () => {
  A = await makeOrg('A')
  B = await makeOrg('B')
})

afterAll(async () => {
  // Cascades delete memberships, sources, transactions, subscriptions, reports.
  await prisma.organization.deleteMany({ where: { id: { in: [A.orgId, B.orgId] } } })
  await prisma.user.deleteMany({ where: { id: { in: [A.userId, B.userId] } } })
  await prisma.$disconnect()
})

describe('orgDb read scoping', () => {
  it('findMany returns only the caller org rows', async () => {
    const db = orgDb(A.orgId)
    const subs = await db.subscription.findMany()
    expect(subs.length).toBe(1)
    expect(subs[0]!.id).toBe(A.subscriptionId)

    const txns = await db.transaction.findMany()
    expect(txns.every((t) => t.orgId === A.orgId)).toBe(true)

    const sources = await db.connectedSource.findMany()
    expect(sources.every((s) => s.orgId === A.orgId)).toBe(true)
  })

  it('findUnique cannot fetch another org row by id', async () => {
    const found = await orgDb(A.orgId).subscription.findUnique({
      where: { id: B.subscriptionId },
    })
    expect(found).toBeNull()
  })

  it('count only counts the caller org', async () => {
    expect(await orgDb(A.orgId).subscription.count()).toBe(1)
  })
})

describe('orgDb write scoping (the review-fixed operations)', () => {
  it('update cannot mutate another org row by id', async () => {
    await expect(
      orgDb(A.orgId).subscription.update({
        where: { id: B.subscriptionId },
        data: { currentAmountCents: 1 },
      }),
    ).rejects.toThrow()

    // B's row is untouched.
    const b = await prisma.subscription.findUnique({ where: { id: B.subscriptionId } })
    expect(b!.currentAmountCents).toBe(1999)
  })

  it('delete cannot remove another org row by id', async () => {
    await expect(
      orgDb(A.orgId).connectedSource.delete({ where: { id: B.sourceId } }),
    ).rejects.toThrow()

    const b = await prisma.connectedSource.findUnique({ where: { id: B.sourceId } })
    expect(b).not.toBeNull()
  })

  it('deleteMany cannot reach across orgs', async () => {
    const result = await orgDb(A.orgId).auditReport.deleteMany({
      where: { id: B.reportId },
    })
    expect(result.count).toBe(0)
    const b = await prisma.auditReport.findUnique({ where: { id: B.reportId } })
    expect(b).not.toBeNull()
  })

  it('create forces the caller org id even if a foreign one is supplied', async () => {
    const date = new Date('2026-02-01T00:00:00Z')
    const created = await orgDb(A.orgId).transaction.create({
      data: {
        // Attempt to plant the row in org B — must be overridden to A.
        orgId: B.orgId,
        sourceId: A.sourceId,
        date,
        amountCents: 500,
        rawDescription: 'INJECT ATTEMPT',
        normalizedMerchant: 'Inject',
        hash: transactionHash(A.orgId, date, 500, 'INJECT ATTEMPT'),
      } as never,
    })
    expect(created.orgId).toBe(A.orgId)
    await prisma.transaction.delete({ where: { id: created.id } })
  })

  it('the caller CAN update its own row (guard is not over-broad)', async () => {
    await orgDb(A.orgId).subscription.update({
      where: { id: A.subscriptionId },
      data: { currentAmountCents: 2499 },
    })
    const a = await prisma.subscription.findUnique({ where: { id: A.subscriptionId } })
    expect(a!.currentAmountCents).toBe(2499)
  })
})
