import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSubscription, parseCustomId } from '@/lib/paypal'
import { requireOrgApi } from '@/lib/session-api'

/**
 * Where PayPal sends the user after they approve the subscription.
 * We verify the subscription server-side (never trust query params
 * alone) and activate the plan immediately for snappy UX; the webhook
 * remains the durable source of truth.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const ctx = await requireOrgApi()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  if ('error' in ctx) return NextResponse.redirect(`${appUrl}/signin`, 303)

  const subscriptionId = new URL(request.url).searchParams.get('subscription_id')
  if (!subscriptionId) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings?billing=canceled`, 303)
  }

  try {
    const subscription = await getSubscription(subscriptionId)
    const custom = parseCustomId(subscription.custom_id)
    const approved =
      subscription.status === 'ACTIVE' || subscription.status === 'APPROVED'

    // The subscription must belong to the org of the signed-in caller.
    if (approved && custom && custom.orgId === ctx.org.id) {
      await prisma.organization.update({
        where: { id: ctx.org.id },
        data: { plan: custom.plan, paypalSubscriptionId: subscription.id },
      })
      return NextResponse.redirect(`${appUrl}/dashboard/settings?billing=success`, 303)
    }
  } catch (error) {
    console.error('[zombly] paypal return failed', error instanceof Error ? error.message : error)
  }
  return NextResponse.redirect(`${appUrl}/dashboard/settings?billing=error`, 303)
}
