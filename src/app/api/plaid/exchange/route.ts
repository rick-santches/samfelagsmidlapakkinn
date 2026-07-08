import { NextResponse } from 'next/server'
import { z } from 'zod'
import { encryptSecret } from '@/lib/crypto'
import { prisma } from '@/lib/db'
import { runPipelineForOrg } from '@/lib/pipeline'
import { plaid } from '@/lib/plaid'
import { planSpec } from '@/lib/plans'
import { requireOrgApi } from '@/lib/session-api'
import { syncPlaidSource } from '@/lib/sources/plaid'

const BodySchema = z.object({
  publicToken: z.string().min(1),
  institutionName: z.string().min(1).max(80).default('Bank account'),
})

export async function POST(request: Request): Promise<NextResponse> {
  const ctx = await requireOrgApi()
  if ('error' in ctx) return ctx.error

  if (!planSpec(ctx.org.plan).plaidAllowed) {
    return NextResponse.json(
      { error: 'Bank connections are a Team plan feature.' },
      { status: 402 },
    )
  }
  const client = plaid()
  if (!client) {
    return NextResponse.json({ error: 'Plaid is not configured.' }, { status: 503 })
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const exchange = await client.itemPublicTokenExchange({
    public_token: parsed.data.publicToken,
  })

  const source = await prisma.connectedSource.create({
    data: {
      orgId: ctx.org.id,
      type: 'PLAID',
      label: parsed.data.institutionName,
      plaidItemId: exchange.data.item_id,
      plaidAccessToken: encryptSecret(exchange.data.access_token),
      status: 'SYNCING',
    },
  })

  const sync = await syncPlaidSource(source.id)
  const pipeline = await runPipelineForOrg(ctx.org.id, new Date(), { sendAlerts: true })

  return NextResponse.json({
    sourceId: source.id,
    importedTransactions: sync.added,
    subscriptions: pipeline.subscriptionCount,
    openFlags: pipeline.openFlagCount,
  })
}
