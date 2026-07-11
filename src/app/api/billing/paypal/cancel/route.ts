import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cancelSubscription } from '@/lib/paypal'
import { requireOrgApi } from '@/lib/session-api'

/** Cancel the org's PayPal subscription (settings form posts here). */
export async function POST(): Promise<NextResponse> {
  const ctx = await requireOrgApi()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  if ('error' in ctx) return ctx.error

  if (ctx.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only the owner can cancel billing' }, { status: 403 })
  }
  const subscriptionId = ctx.org.paypalSubscriptionId
  if (!subscriptionId) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings`, 303)
  }

  try {
    await cancelSubscription(subscriptionId, 'Canceled from Zombly settings')
  } catch (error) {
    // Already-canceled subscriptions throw — treat as done.
    console.error('[zombly] paypal cancel', error instanceof Error ? error.message : error)
  }
  await prisma.organization.update({
    where: { id: ctx.org.id },
    data: { plan: 'FREE', paypalSubscriptionId: null },
  })
  return NextResponse.redirect(`${appUrl}/dashboard/settings?billing=canceled_plan`, 303)
}
