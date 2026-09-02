import { PrismaClient } from '@prisma/client'
import { normalizeMerchant } from '../src/lib/engine'
import { transactionHash } from '../src/lib/hash'
import { runPipelineForOrg } from '../src/lib/pipeline'
import { buildFixtureTransactions, CONFIRMED_MERCHANTS } from './fixtures'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const now = new Date()

  const user = await prisma.user.upsert({
    where: { email: 'demo@zombly.com' },
    update: {},
    create: { email: 'demo@zombly.com', name: 'Demo Owner', emailVerified: now },
  })

  // Re-seed from scratch: nuke the demo org so the demo is deterministic.
  await prisma.organization.deleteMany({ where: { name: 'Zombly Demo Co' } })

  const org = await prisma.organization.create({
    data: {
      name: 'Zombly Demo Co',
      plan: 'TEAM',
      memberships: { create: { userId: user.id, role: 'OWNER' } },
    },
  })

  const source = await prisma.connectedSource.create({
    data: {
      orgId: org.id,
      type: 'CSV',
      label: 'Chase Business Card ····4821',
      status: 'ACTIVE',
      lastSyncedAt: now,
    },
  })

  const fixtures = buildFixtureTransactions(now)
  await prisma.transaction.createMany({
    data: fixtures.map((t) => {
      const norm = normalizeMerchant(t.rawDescription)
      return {
        orgId: org.id,
        sourceId: source.id,
        date: t.date,
        amountCents: t.amountCents,
        currency: 'USD',
        rawDescription: t.rawDescription,
        normalizedMerchant: norm.merchant,
        category: norm.category ?? null,
        hash: transactionHash(org.id, t.date, t.amountCents, t.rawDescription),
      }
    }),
    skipDuplicates: true,
  })

  // First pass creates the subscriptions; then mark the tools the demo
  // team "confirmed in review", wipe the fresh flags, and re-run so the
  // flag set respects those confirmations (exactly like the real review
  // flow would over time).
  await runPipelineForOrg(org.id, now)
  await prisma.subscription.updateMany({
    where: { orgId: org.id, merchantName: { in: [...CONFIRMED_MERCHANTS] } },
    data: { confirmedInUseAt: now },
  })
  await prisma.flag.deleteMany({ where: { subscription: { orgId: org.id } } })
  const result = await runPipelineForOrg(org.id, now)

  const flagsByType = await prisma.flag.groupBy({
    by: ['type'],
    where: { subscription: { orgId: org.id } },
    _count: true,
  })

  console.log(`Seeded org "${org.name}"`)
  console.log(`  transactions: ${await prisma.transaction.count({ where: { orgId: org.id } })}`)
  console.log(`  subscriptions: ${result.subscriptionCount}`)
  console.log(`  monthly recurring spend: $${(result.totalMonthlySpendCents / 100).toFixed(2)}`)
  console.log(`  flagged annual savings: $${(result.totalFlaggedSavingsCents / 100).toFixed(2)}`)
  for (const row of flagsByType) {
    console.log(`  flag ${row.type}: ${row._count}`)
  }

  const expected = ['DUPLICATE', 'OVERLAP', 'ZOMBIE', 'PRICE_HIKE', 'TRIAL_CONVERTED', 'FORGOTTEN_ANNUAL']
  const present = new Set(flagsByType.map((r) => r.type as string))
  const missing = expected.filter((t) => !present.has(t))
  if (missing.length > 0) {
    throw new Error(`Seed sanity check failed — missing flag types: ${missing.join(', ')}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
