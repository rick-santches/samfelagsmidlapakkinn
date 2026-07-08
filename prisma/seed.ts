import { PrismaClient } from '@prisma/client'
import { buildFixtureTransactions } from './fixtures'
import { transactionHash } from '../src/lib/hash'

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
    data: fixtures.map((t) => ({
      orgId: org.id,
      sourceId: source.id,
      date: t.date,
      amountCents: t.amountCents,
      currency: 'USD',
      rawDescription: t.rawDescription,
      // Phase 2 upgrades this to the engine's merchant normalization.
      normalizedMerchant: t.rawDescription,
      hash: transactionHash(org.id, t.date, t.amountCents, t.rawDescription),
    })),
    skipDuplicates: true,
  })

  const count = await prisma.transaction.count({ where: { orgId: org.id } })
  console.log(`Seeded org "${org.name}" with ${count} transactions.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
