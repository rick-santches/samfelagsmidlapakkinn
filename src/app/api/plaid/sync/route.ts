import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { runPipelineForOrg } from '@/lib/pipeline'
import { requireOrgApi } from '@/lib/session-api'
import { syncPlaidSource } from '@/lib/sources/plaid'

const BodySchema = z.object({ sourceId: z.string().min(1) })

export async function POST(request: Request): Promise<NextResponse> {
  const ctx = await requireOrgApi()
  if ('error' in ctx) return ctx.error

  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Scope check: the source must belong to the caller's org.
  const source = await prisma.connectedSource.findFirst({
    where: { id: parsed.data.sourceId, orgId: ctx.org.id, type: 'PLAID' },
  })
  if (!source) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 })
  }

  try {
    const sync = await syncPlaidSource(source.id)
    const pipeline = await runPipelineForOrg(ctx.org.id, new Date(), { sendAlerts: true })
    return NextResponse.json({
      importedTransactions: sync.added,
      subscriptions: pipeline.subscriptionCount,
      openFlags: pipeline.openFlagCount,
    })
  } catch (error) {
    await prisma.connectedSource.update({
      where: { id: source.id },
      data: { status: 'ERROR' },
    })
    console.error('[zombly] plaid sync failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Sync failed — try reconnecting the bank.' }, { status: 502 })
  }
}
