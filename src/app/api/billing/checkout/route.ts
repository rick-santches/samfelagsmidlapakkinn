import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { PLANS } from '@/lib/plans'
import { requireOrgApi } from '@/lib/session-api'
import { stripe } from '@/lib/stripe'

const QuerySchema = z.object({
  plan: z.enum(['SOLO', 'TEAM']),
  interval: z.enum(['month', 'year']).default('month'),
})

export async function GET(request: Request): Promise<NextResponse> {
  const ctx = await requireOrgApi()
  if ('error' in ctx) return ctx.error
  const { org, user } = ctx

  const url = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    plan: url.searchParams.get('plan'),
    interval: url.searchParams.get('interval') ?? 'month',
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan or interval' }, { status: 400 })
  }
  const { plan, interval } = parsed.data

  const client = stripe()
  if (!client) {
    return NextResponse.json(
      { error: 'Stripe is not configured — set STRIPE_SECRET_KEY.' },
      { status: 503 },
    )
  }

  const spec = PLANS[plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Reuse the org's Stripe customer across upgrades/downgrades.
  let customerId = org.stripeCustomerId
  if (!customerId) {
    const customer = await client.customers.create({
      email: user.email,
      name: org.name,
      metadata: { orgId: org.id },
    })
    customerId = customer.id
    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeCustomerId: customerId },
    })
  }

  // Inline price_data: works in any Stripe account with zero dashboard
  // setup — no hardcoded price IDs to drift out of sync.
  const session = await client.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          recurring: { interval },
          unit_amount: interval === 'month' ? spec.monthlyCents : spec.annualCents,
          product_data: {
            name: `Zombly ${spec.name}`,
            description: spec.blurb,
          },
        },
      },
    ],
    subscription_data: { metadata: { orgId: org.id, plan } },
    metadata: { orgId: org.id, plan },
    success_url: `${appUrl}/dashboard/settings?billing=success`,
    cancel_url: `${appUrl}/dashboard/settings?billing=canceled`,
    allow_promotion_codes: true,
  })

  return NextResponse.redirect(session.url ?? `${appUrl}/dashboard/settings`, 303)
}
