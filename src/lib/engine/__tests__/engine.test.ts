import { describe, expect, it } from 'vitest'
import { buildFixtureTransactions, CONFIRMED_MERCHANTS } from '../../../../prisma/fixtures'
import { runDetection } from '../index'
import { monthlyizedCents } from '../recurrence'
import type { EngineFlagType } from '../types'

/**
 * End-to-end: run the real engine over the demo fixture statement
 * (the same data the seed loads) and assert the whole product story —
 * every flag type fires, noise stays out, numbers stay sane.
 */
describe('runDetection on the demo fixtures', () => {
  const now = new Date('2026-07-08T00:00:00Z')
  const fixtures = buildFixtureTransactions(now)
  const result = runDetection(
    fixtures.map((f, i) => ({
      id: `fx${i}`,
      date: f.date,
      amountCents: f.amountCents,
      rawDescription: f.rawDescription,
    })),
    { now, confirmedMerchants: new Set(CONFIRMED_MERCHANTS) },
  )

  it('detects the expected SaaS stack', () => {
    const merchants = new Set(result.subscriptions.map((s) => s.merchant))
    for (const expected of [
      'Slack',
      'GitHub',
      'Google Workspace',
      'Figma',
      'QuickBooks',
      'Adobe Creative Cloud',
      'Amazon Web Services',
      'Dropbox',
      'Zoom',
      'Google Meet',
      'Notion',
      'Confluence',
      'Zapier',
      'LinkedIn',
      'HubSpot',
      'Squarespace',
      'Microsoft 365',
    ]) {
      expect(merchants, `missing ${expected}`).toContain(expected)
    }
  })

  it('produces at least one flag of every type', () => {
    const types = new Set(result.flags.map((f) => f.type))
    const all: EngineFlagType[] = [
      'DUPLICATE',
      'OVERLAP',
      'ZOMBIE',
      'PRICE_HIKE',
      'TRIAL_CONVERTED',
      'FORGOTTEN_ANNUAL',
    ]
    for (const type of all) {
      expect(types, `missing flag type ${type}`).toContain(type)
    }
  })

  it('keeps one-off noise out of subscriptions', () => {
    const merchants = result.subscriptions.map((s) => s.merchant.toUpperCase())
    for (const noise of ['STARBUCKS', 'UBER', 'MARRIOTT', 'DELTA', 'DELL', 'HILTON', 'OFFICE DEPOT']) {
      expect(merchants.find((mn) => mn.includes(noise)), `${noise} slipped in`).toBeUndefined()
    }
  })

  it('two Dropbox plans exist and exactly one DUPLICATE flag fires', () => {
    const dropbox = result.subscriptions.filter((s) => s.merchant === 'Dropbox')
    expect(dropbox).toHaveLength(2)
    expect(result.flags.filter((f) => f.type === 'DUPLICATE')).toHaveLength(1)
  })

  it('exactly one PRICE_HIKE fires — Adobe, not AWS usage swings', () => {
    const hikes = result.flags.filter((f) => f.type === 'PRICE_HIKE')
    expect(hikes).toHaveLength(1)
    expect(hikes[0]!.dedupeKey).toBe('PRICE_HIKE:5499:5999')
  })

  it('every flag points at a detected subscription', () => {
    const keys = new Set(result.subscriptions.map((s) => s.key))
    for (const flag of result.flags) {
      expect(keys).toContain(flag.subscriptionKey)
    }
  })

  it('total monthly recurring spend lands in a realistic band', () => {
    const total = result.subscriptions
      .filter((s) => s.active)
      .reduce((sum, s) => sum + monthlyizedCents(s), 0)
    // demo stack is ~$1.1k–$1.6k/mo of SaaS
    expect(total).toBeGreaterThan(80_000)
    expect(total).toBeLessThan(250_000)
  })
})
