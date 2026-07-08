import { describe, expect, it } from 'vitest'
import { annualizedCents, detectRecurrences, monthlyizedCents } from '../recurrence'
import type { EngineTransaction } from '../types'

const NOW = new Date('2026-07-08T00:00:00Z')

let nextId = 0
function tx(daysAgo: number, amountCents: number, rawDescription: string): EngineTransaction {
  const date = new Date(NOW)
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return { id: `t${nextId++}`, date, amountCents, rawDescription }
}

function monthly(
  descriptor: string,
  amountCents: number,
  months: number,
  offsets: number[] = [],
): EngineTransaction[] {
  const out: EngineTransaction[] = []
  for (let i = 0; i < months; i++) {
    out.push(tx(15 + i * 30 + (offsets[i] ?? 0), amountCents, descriptor))
  }
  return out
}

describe('detectRecurrences — cadence inference', () => {
  it('detects a clean monthly subscription', () => {
    const { subscriptions } = detectRecurrences(monthly('SLACK T01 SLACK.COM', 8750, 12), NOW)
    expect(subscriptions).toHaveLength(1)
    const sub = subscriptions[0]!
    expect(sub.merchant).toBe('Slack')
    expect(sub.cadence).toBe('MONTHLY')
    expect(sub.currentAmountCents).toBe(8750)
    expect(sub.confidence).toBeGreaterThan(0.8)
    expect(sub.active).toBe(true)
  })

  it('tolerates ±4 days of monthly jitter', () => {
    const jitter = [0, 3, -4, 2, -3, 4, 0, -2, 1, 3, -1, 2]
    const { subscriptions } = detectRecurrences(monthly('ZOOM.US 888', 1599, 12, jitter), NOW)
    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0]!.cadence).toBe('MONTHLY')
  })

  it('detects annual cadence from two charges ±10 days', () => {
    const { subscriptions } = detectRecurrences(
      [tx(345, 21600, 'SQSP* INV1 NEW YORK'), tx(345 + 368, 21600, 'SQSP* INV2 NEW YORK')],
      NOW,
    )
    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0]!.cadence).toBe('ANNUAL')
  })

  it('detects weekly cadence with at least 3 charges', () => {
    const charges = [tx(7, 2500, 'CLEANCO WEEKLY'), tx(14, 2500, 'CLEANCO WEEKLY'), tx(21, 2500, 'CLEANCO WEEKLY'), tx(28, 2500, 'CLEANCO WEEKLY')]
    const { subscriptions } = detectRecurrences(charges, NOW)
    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0]!.cadence).toBe('WEEKLY')
  })

  it('detects quarterly cadence', () => {
    const charges = [tx(30, 30000, 'PESTPRO QTRLY'), tx(121, 30000, 'PESTPRO QTRLY'), tx(213, 30000, 'PESTPRO QTRLY')]
    const { subscriptions } = detectRecurrences(charges, NOW)
    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0]!.cadence).toBe('QUARTERLY')
  })

  it('ignores one-off purchases and sparse repeats', () => {
    const { subscriptions } = detectRecurrences(
      [
        tx(512, 12483, 'AMAZON MKTPL*RT4Y88 SEATTLE WA'),
        tx(311, 990, 'STARBUCKS STORE 10281 SEATTLE'),
        tx(64, 780, 'STARBUCKS STORE 10281 SEATTLE'),
        tx(493, 3410, 'UBER TRIP HELP.UBER.COM'),
        tx(88, 2100, 'UBER TRIP HELP.UBER.COM'),
        tx(7, 3200, 'UBER TRIP HELP.UBER.COM'),
      ],
      NOW,
    )
    expect(subscriptions).toHaveLength(0)
  })

  it('ignores credits and refunds', () => {
    const { subscriptions } = detectRecurrences(
      monthly('SLACK T01 SLACK.COM', -8750, 12),
      NOW,
    )
    expect(subscriptions).toHaveLength(0)
  })
})

describe('detectRecurrences — amount clustering', () => {
  it('keeps two parallel plans of the same merchant separate (duplicate Dropbox)', () => {
    const charges = [
      ...monthly('DROPBOX*8H2K1PQRS7T4', 1999, 10),
      ...monthly('DROPBOX INTL RENEWAL DUBLIN', 2400, 6),
    ]
    const { subscriptions } = detectRecurrences(charges, NOW)
    expect(subscriptions).toHaveLength(2)
    expect(new Set(subscriptions.map((s) => s.merchant))).toEqual(new Set(['Dropbox']))
    expect(subscriptions.map((s) => s.currentAmountCents).sort()).toEqual([1999, 2400])
  })

  it('keeps a price-hiked subscription in ONE cluster', () => {
    const charges = [
      ...monthly('ADOBE *CREATIVE CLOUD', 5999, 4),
      ...[4, 5, 6, 7, 8, 9].map((i) => tx(15 + i * 30, 5499, 'ADOBE *CREATIVE CLOUD')),
    ]
    const { subscriptions } = detectRecurrences(charges, NOW)
    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0]!.currentAmountCents).toBe(5999)
    expect(subscriptions[0]!.charges).toHaveLength(10)
  })

  it('merges variable usage-billed charges into one subscription (AWS-style)', () => {
    const amounts = [21000, 27500, 24100, 29800, 22400, 30000, 25900, 21500, 28700, 23300, 26800, 29100]
    const charges = amounts.map((amt, i) => tx(10 + i * 30, amt, 'AMAZON WEB SERVICES AWS.AMAZON.CO'))
    const { subscriptions } = detectRecurrences(charges, NOW)
    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0]!.merchant).toBe('Amazon Web Services')
    expect(subscriptions[0]!.cadence).toBe('MONTHLY')
  })

  it('never turns trial-sized charges into their own subscription', () => {
    const charges = [tx(130, 100, 'HUBSPOT INC.'), ...monthly('HUBSPOT INC.', 4500, 4)]
    const { subscriptions } = detectRecurrences(charges, NOW)
    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0]!.currentAmountCents).toBe(4500)
  })
})

describe('activity + money math', () => {
  it('marks a long-dead subscription inactive', () => {
    const charges = [tx(400, 1500, 'OLDTOOL.IO'), tx(430, 1500, 'OLDTOOL.IO'), tx(460, 1500, 'OLDTOOL.IO'), tx(490, 1500, 'OLDTOOL.IO')]
    const { subscriptions } = detectRecurrences(charges, NOW)
    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0]!.active).toBe(false)
  })

  it('monthlyizes and annualizes each cadence', () => {
    const make = (cadence: string, amountCents: number) =>
      ({
        key: 'k',
        merchant: 'X',
        cadence,
        currentAmountCents: amountCents,
        charges: [],
        firstSeen: NOW,
        lastSeen: NOW,
        confidence: 1,
        commonlyForgotten: false,
        active: true,
        variableAmount: false,
      }) as Parameters<typeof monthlyizedCents>[0]
    expect(monthlyizedCents(make('MONTHLY', 1000))).toBe(1000)
    expect(monthlyizedCents(make('ANNUAL', 12000))).toBe(1000)
    expect(monthlyizedCents(make('QUARTERLY', 3000))).toBe(1000)
    expect(monthlyizedCents(make('WEEKLY', 1000))).toBe(4330)
    expect(annualizedCents(make('ANNUAL', 12000))).toBe(12000)
    expect(annualizedCents(make('MONTHLY', 1000))).toBe(12000)
  })
})
