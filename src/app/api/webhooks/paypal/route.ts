import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseCustomId, paypalConfigured, verifyWebhook } from '@/lib/paypal'

export const dynamic = 'force-dynamic'

interface PaypalWebhookEvent {
  event_type?: string
  resource?: {
    id?: string
    custom_id?: string
    status?: string
  }
}

/**
 * PayPal → Organization.plan. Signature-verified via PayPal's
 * verify-webhook-signature endpoint (requires PAYPAL_WEBHOOK_ID).
 * custom_id = "orgId|PLAN", stamped at subscription creation.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!paypalConfigured() || !process.env.PAYPAL_WEBHOOK_ID) {
    return NextResponse.json({ error: 'PayPal webhook not configured' }, { status: 503 })
  }

  let event: PaypalWebhookEvent
  try {
    event = (await request.json()) as PaypalWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 })
  }

  const verified = await verifyWebhook(request.headers, event).catch(() => false)
  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const custom = parseCustomId(event.resource?.custom_id)
  const subscriptionId = event.resource?.id

  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED': {
      if (custom && subscriptionId) {
        await prisma.organization.update({
          where: { id: custom.orgId },
          data: { plan: custom.plan, paypalSubscriptionId: subscriptionId },
        })
      }
      break
    }
    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
    case 'BILLING.SUBSCRIPTION.EXPIRED': {
      if (custom) {
        // Only downgrade if this event is about the org's CURRENT
        // subscription — an old canceled sub must not clobber a new one.
        await prisma.organization.updateMany({
          where: { id: custom.orgId, paypalSubscriptionId: subscriptionId ?? undefined },
          data: { plan: 'FREE', paypalSubscriptionId: null },
        })
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
