import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import type { Plan } from '@prisma/client'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

function planFromMetadata(metadata: Stripe.Metadata | null): Plan | null {
  const plan = metadata?.plan
  return plan === 'SOLO' || plan === 'TEAM' ? plan : null
}

/**
 * Stripe → Organization.plan. Metadata (orgId, plan) is stamped on both
 * the checkout session and the subscription at checkout time, so every
 * event self-identifies its org.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const client = stripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!client || !secret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = client.webhooks.constructEvent(await request.text(), signature, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const orgId = session.metadata?.orgId
      const plan = planFromMetadata(session.metadata ?? null)
      if (orgId && plan) {
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan,
            stripeCustomerId:
              typeof session.customer === 'string' ? session.customer : undefined,
            stripeSubscriptionId:
              typeof session.subscription === 'string' ? session.subscription : undefined,
          },
        })
      }
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const orgId = subscription.metadata?.orgId
      const plan = planFromMetadata(subscription.metadata ?? null)
      if (orgId && plan) {
        const active =
          subscription.status === 'active' || subscription.status === 'trialing'
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan: active ? plan : 'FREE',
            stripeSubscriptionId: subscription.id,
          },
        })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const orgId = subscription.metadata?.orgId
      if (orgId) {
        await prisma.organization.update({
          where: { id: orgId },
          data: { plan: 'FREE', stripeSubscriptionId: null },
        })
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
