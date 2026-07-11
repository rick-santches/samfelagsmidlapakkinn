import type { Plan } from '@prisma/client'
import { prisma } from './db'
import { PLANS } from './plans'

/**
 * PayPal Subscriptions integration — the billing rail for merchants in
 * countries Stripe doesn't serve (like Iceland). Zero SDK: plain REST
 * calls against api-m.paypal.com (or the sandbox). Same plan-gating as
 * Stripe; whichever rail is configured powers the checkout buttons.
 */

const BASE = () =>
  (process.env.PAYPAL_ENV ?? 'live') === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'

export function paypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function accessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) throw new Error('PayPal is not configured')

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const response = await fetch(`${BASE()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!response.ok) throw new Error(`PayPal auth failed: ${response.status}`)
  const data = (await response.json()) as { access_token: string; expires_in: number }
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return data.access_token
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await accessToken()
  const response = await fetch(`${BASE()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`PayPal ${path} → ${response.status}: ${body.slice(0, 300)}`)
  }
  // Some endpoints (cancel) return 204 with no body.
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export type BillingInterval = 'month' | 'year'

/**
 * Get (or lazily create) the PayPal billing plan for a Zombly plan +
 * interval. Product/plan IDs are cached in the DB, so the PayPal
 * catalog is only written once per combination.
 */
export async function ensurePaypalPlan(
  plan: Exclude<Plan, 'FREE'>,
  interval: BillingInterval,
): Promise<string> {
  const planKey = `${plan}:${interval}`
  const cached = await prisma.paypalPlan.findUnique({ where: { planKey } })
  if (cached) return cached.paypalPlanId

  const spec = PLANS[plan]
  const priceCents = interval === 'month' ? spec.monthlyCents : spec.annualCents

  const product = await api<{ id: string }>('/v1/catalogs/products', {
    method: 'POST',
    body: JSON.stringify({
      name: `Zombly ${spec.name}`,
      description: spec.blurb.slice(0, 250),
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  })

  const billingPlan = await api<{ id: string }>('/v1/billing/plans', {
    method: 'POST',
    body: JSON.stringify({
      product_id: product.id,
      name: `Zombly ${spec.name} (${interval === 'month' ? 'monthly' : 'annual'})`,
      billing_cycles: [
        {
          frequency: { interval_unit: interval === 'month' ? 'MONTH' : 'YEAR', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // renews until canceled
          pricing_scheme: {
            fixed_price: { value: (priceCents / 100).toFixed(2), currency_code: 'USD' },
          },
        },
      ],
      payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 2 },
    }),
  })

  await prisma.paypalPlan.create({ data: { planKey, paypalPlanId: billingPlan.id } })
  return billingPlan.id
}

export interface PaypalSubscription {
  id: string
  status: string
  custom_id?: string
  links?: Array<{ rel: string; href: string }>
}

/** Create a subscription and return the PayPal approval URL to redirect to. */
export async function createSubscription(input: {
  paypalPlanId: string
  orgId: string
  plan: Plan
  returnUrl: string
  cancelUrl: string
}): Promise<string> {
  const subscription = await api<PaypalSubscription>('/v1/billing/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: input.paypalPlanId,
      // custom_id travels through every webhook — it's how events find the org.
      custom_id: `${input.orgId}|${input.plan}`,
      application_context: {
        brand_name: 'Zombly',
        user_action: 'SUBSCRIBE_NOW',
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  })
  const approve = subscription.links?.find((l) => l.rel === 'approve')?.href
  if (!approve) throw new Error('PayPal did not return an approval link')
  return approve
}

export async function getSubscription(id: string): Promise<PaypalSubscription> {
  return api<PaypalSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(id)}`)
}

export async function cancelSubscription(id: string, reason: string): Promise<void> {
  await api<void>(`/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason.slice(0, 120) }),
  })
}

/**
 * Verify a webhook came from PayPal (signature check via PayPal's own
 * verification endpoint). Requires PAYPAL_WEBHOOK_ID from the dashboard.
 */
export async function verifyWebhook(
  headers: Headers,
  rawEvent: unknown,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) return false
  const result = await api<{ verification_status: string }>(
    '/v1/notifications/verify-webhook-signature',
    {
      method: 'POST',
      body: JSON.stringify({
        auth_algo: headers.get('paypal-auth-algo'),
        cert_url: headers.get('paypal-cert-url'),
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        transmission_time: headers.get('paypal-transmission-time'),
        webhook_id: webhookId,
        webhook_event: rawEvent,
      }),
    },
  )
  return result.verification_status === 'SUCCESS'
}

/** Parse the org + plan back out of a subscription's custom_id. */
export function parseCustomId(customId: string | undefined): { orgId: string; plan: Plan } | null {
  if (!customId) return null
  const [orgId, plan] = customId.split('|')
  if (!orgId || (plan !== 'SOLO' && plan !== 'TEAM')) return null
  return { orgId, plan }
}
