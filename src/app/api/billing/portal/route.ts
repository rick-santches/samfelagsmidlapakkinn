import { NextResponse } from 'next/server'
import { requireOrgApi } from '@/lib/session-api'
import { stripe } from '@/lib/stripe'

export async function GET(): Promise<NextResponse> {
  const ctx = await requireOrgApi()
  if ('error' in ctx) return ctx.error

  // Billing management is owner-only, matching the cancel routes.
  if (ctx.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only the owner can manage billing' }, { status: 403 })
  }

  const client = stripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  if (!client || !ctx.org.stripeCustomerId) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings`, 303)
  }

  const session = await client.billingPortal.sessions.create({
    customer: ctx.org.stripeCustomerId,
    return_url: `${appUrl}/dashboard/settings`,
  })
  return NextResponse.redirect(session.url, 303)
}
