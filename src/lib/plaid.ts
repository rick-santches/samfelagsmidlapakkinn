import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

/**
 * Lazy Plaid client — the app runs without Plaid creds (the Sources
 * page explains what's missing instead of crashing).
 */
let client: PlaidApi | null = null

export function plaid(): PlaidApi | null {
  const clientId = process.env.PLAID_CLIENT_ID
  const secret = process.env.PLAID_SECRET
  if (!clientId || !secret) return null
  if (!client) {
    const env = process.env.PLAID_ENV ?? 'sandbox'
    client = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments[env] ?? PlaidEnvironments.sandbox,
        baseOptions: {
          headers: { 'PLAID-CLIENT-ID': clientId, 'PLAID-SECRET': secret },
        },
      }),
    )
  }
  return client
}

export function plaidConfigured(): boolean {
  return Boolean(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET)
}
