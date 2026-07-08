import Stripe from 'stripe'

/**
 * Lazy Stripe client — the app boots and runs without keys (billing
 * buttons explain what's missing instead of crashing).
 */
let client: Stripe | null = null

export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!client) client = new Stripe(key, { apiVersion: '2025-02-24.acacia' })
  return client
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
