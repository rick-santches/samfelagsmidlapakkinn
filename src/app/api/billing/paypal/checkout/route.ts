import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSubscription, ensurePaypalPlan, paypalConfigured } from '@/lib/paypal'
import { requireOrgApi } from '@/lib/session-api'

const QuerySchema = z.object({
  plan: z.enum(['SOLO', 'TEAM']),
  interval: z.enum(['month', 'year']).default('month'),
})

export async function GET(request: Request): Promise<NextResponse> {
  const ctx = await requireOrgApi()
  if ('error' in ctx) return ctx.error

  const url = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    plan: url.searchParams.get('plan'),
    interval: url.searchParams.get('interval') ?? 'month',
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan or interval' }, { status: 400 })
  }

  if (!paypalConfigured()) {
    return NextResponse.json(
      { error: 'PayPal is not configured — set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.' },
      { status: 503 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  try {
    const paypalPlanId = await ensurePaypalPlan(parsed.data.plan, parsed.data.interval)
    const approveUrl = await createSubscription({
      paypalPlanId,
      orgId: ctx.org.id,
      plan: parsed.data.plan,
      returnUrl: `${appUrl}/api/billing/paypal/return`,
      cancelUrl: `${appUrl}/dashboard/settings?billing=canceled`,
    })
    return NextResponse.redirect(approveUrl, 303)
  } catch (error) {
    console.error('[zombly] paypal checkout failed', error instanceof Error ? error.message : error)
    return NextResponse.redirect(`${appUrl}/dashboard/settings?billing=error`, 303)
  }
}
