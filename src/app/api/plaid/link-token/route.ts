import { NextResponse } from 'next/server'
import { CountryCode, Products } from 'plaid'
import { plaid } from '@/lib/plaid'
import { planSpec } from '@/lib/plans'
import { requireOrgApi } from '@/lib/session-api'

export async function POST(): Promise<NextResponse> {
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
    return NextResponse.json(
      { error: 'Plaid is not configured — set PLAID_CLIENT_ID and PLAID_SECRET.' },
      { status: 503 },
    )
  }

  const response = await client.linkTokenCreate({
    user: { client_user_id: ctx.user.id },
    client_name: 'Zombly',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
    transactions: { days_requested: 545 },
  })

  return NextResponse.json({ linkToken: response.data.link_token })
}
