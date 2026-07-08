import { NextResponse } from 'next/server'
import { buildAndSendWeeklyDigest } from '@/lib/alerts'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Weekly digest for every paid org. Wire to Vercel Cron (vercel.json →
 * Mondays 14:00 UTC) or any scheduler; authenticated via CRON_SECRET.
 * Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orgs = await prisma.organization.findMany({
    where: { plan: { in: ['SOLO', 'TEAM'] } },
    select: { id: true, name: true, plan: true },
  })

  let sent = 0
  for (const org of orgs) {
    try {
      if (await buildAndSendWeeklyDigest(org)) sent++
    } catch (error) {
      console.error(`[zombly] digest failed for org ${org.id}`, error)
    }
  }

  return NextResponse.json({ orgs: orgs.length, sent })
}
