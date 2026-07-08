import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { orgDb, prisma } from '@/lib/db'
import { normalizeMerchant } from '@/lib/engine'
import { transactionHash } from '@/lib/hash'
import { runPipelineForOrg } from '@/lib/pipeline'
import { canAddSource, planSpec } from '@/lib/plans'
import { ColumnMappingSchema, parseStatementRows } from '@/lib/sources/csv'

const BodySchema = z.object({
  label: z.string().min(1).max(80),
  mapping: ColumnMappingSchema,
  // Rows as parsed by the browser (papaparse header mode). The server
  // re-validates and re-parses every row — the client is a preview.
  rows: z
    .array(z.record(z.string(), z.string().nullable().optional()))
    .min(1)
    .max(20_000),
})

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: { org: true },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  })
  if (!membership) {
    return NextResponse.json({ error: 'No organization' }, { status: 403 })
  }
  const orgId = membership.orgId

  // Plan limit, enforced where it counts — the server.
  const sourceCount = await prisma.connectedSource.count({ where: { orgId } })
  if (!canAddSource(membership.org.plan, sourceCount)) {
    return NextResponse.json(
      {
        error: `The ${planSpec(membership.org.plan).name} plan includes ${planSpec(membership.org.plan).maxSources} source. Upgrade to Team for unlimited sources.`,
      },
      { status: 402 },
    )
  }

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await request.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: error.issues.slice(0, 5) },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 })
  }

  const { transactions, errors } = parseStatementRows(body.rows, body.mapping)
  if (transactions.length === 0) {
    return NextResponse.json(
      { error: 'No parseable transactions found — check the column mapping.', rowErrors: errors.slice(0, 10) },
      { status: 422 },
    )
  }

  const db = orgDb(orgId)
  const source = await db.connectedSource.create({
    data: {
      type: 'CSV',
      label: body.label,
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
    } as never,
  })

  const inserted = await db.transaction.createMany({
    data: transactions.map((t) => {
      const norm = normalizeMerchant(t.rawDescription)
      return {
        sourceId: source.id,
        date: t.date,
        amountCents: t.amountCents,
        currency: t.currency,
        rawDescription: t.rawDescription,
        normalizedMerchant: norm.merchant,
        category: norm.category ?? null,
        hash: transactionHash(orgId, t.date, t.amountCents, t.rawDescription),
      }
    }) as never,
    skipDuplicates: true,
  })

  // A statement that was already fully imported shouldn't leave an empty
  // source behind in the list.
  if (inserted.count === 0) {
    await prisma.connectedSource.delete({ where: { id: source.id } })
  }

  const pipeline = await runPipelineForOrg(orgId, new Date(), { sendAlerts: true })

  return NextResponse.json({
    sourceId: source.id,
    parsedRows: transactions.length,
    importedTransactions: inserted.count,
    duplicatesSkipped: transactions.length - inserted.count,
    rowErrors: errors.slice(0, 10),
    subscriptions: pipeline.subscriptionCount,
    openFlags: pipeline.openFlagCount,
    totalMonthlySpendCents: pipeline.totalMonthlySpendCents,
    totalFlaggedSavingsCents: pipeline.totalFlaggedSavingsCents,
  })
}
