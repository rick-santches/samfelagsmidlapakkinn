import { describe, expect, it } from 'vitest'
import { runDetection } from '../index'
import type { EngineTransaction } from '../types'

const NOW = new Date('2026-07-08T00:00:00Z')

let nextId = 0
function tx(daysAgo: number, amountCents: number, rawDescription: string): EngineTransaction {
  const date = new Date(NOW)
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return { id: `t${nextId++}`, date, amountCents, rawDescription }
}

function monthly(descriptor: string, amountCents: number, months: number, startDay = 15): EngineTransaction[] {
  return Array.from({ length: months }, (_, i) => tx(startDay + i * 30, amountCents, descriptor))
}

function flagsOf(transactions: EngineTransaction[], confirmed: string[] = []) {
  return runDetection(transactions, {
    now: NOW,
    confirmedMerchants: new Set(confirmed),
  }).flags
}

describe('DUPLICATE', () => {
  it('fires when the same merchant bills two live plans', () => {
    const flags = flagsOf(
      [...monthly('DROPBOX*AAA', 1999, 10), ...monthly('DROPBOX INTL BBB', 2400, 6)],
      ['Dropbox'],
    )
    const dup = flags.filter((f) => f.type === 'DUPLICATE')
    expect(dup).toHaveLength(1)
    // savings = annualized cheaper plan
    expect(dup[0]!.estimatedAnnualSavingsCents).toBe(1999 * 12)
    expect(dup[0]!.explanation).toContain('Dropbox')
  })

  it('does not fire when the old plan already ended', () => {
    const old = Array.from({ length: 6 }, (_, i) => tx(400 + i * 30, 1999, 'DROPBOX*AAA'))
    const current = monthly('DROPBOX INTL BBB', 2400, 6)
    const flags = flagsOf([...old, ...current], ['Dropbox'])
    expect(flags.filter((f) => f.type === 'DUPLICATE')).toHaveLength(0)
  })
})

describe('OVERLAP', () => {
  it('fires for two live tools in the same category, targeting the unconfirmed one', () => {
    const flags = flagsOf(
      [...monthly('ZOOM.US 888', 1599, 12), ...monthly('GOOGLE *MEET PREMIUM', 1200, 8)],
      ['Zoom'],
    )
    const overlap = flags.filter((f) => f.type === 'OVERLAP')
    expect(overlap).toHaveLength(1)
    expect(overlap[0]!.explanation).toContain('Zoom')
    expect(overlap[0]!.explanation).toContain('Google Meet')
    expect(overlap[0]!.estimatedAnnualSavingsCents).toBe(1200 * 12)
  })

  it('stays quiet when the user confirmed both tools', () => {
    const flags = flagsOf(
      [...monthly('ZOOM.US 888', 1599, 12), ...monthly('GOOGLE *MEET PREMIUM', 1200, 8)],
      ['Zoom', 'Google Meet'],
    )
    expect(flags.filter((f) => f.type === 'OVERLAP')).toHaveLength(0)
  })

  it('ignores categories outside the overlap taxonomy', () => {
    // Two media subscriptions is a choice, not necessarily waste
    const flags = flagsOf([...monthly('NETFLIX.COM', 1549, 8), ...monthly('SPOTIFY USA', 1099, 8)])
    expect(flags.filter((f) => f.type === 'OVERLAP')).toHaveLength(0)
  })
})

describe('ZOMBIE', () => {
  it('fires after 6+ unconfirmed months', () => {
    const flags = flagsOf(monthly('ZAPIER.COM/CHARGE', 2999, 10))
    const zombies = flags.filter((f) => f.type === 'ZOMBIE')
    expect(zombies).toHaveLength(1)
    expect(zombies[0]!.estimatedAnnualSavingsCents).toBe(2999 * 12)
    expect(zombies[0]!.explanation).toContain('Zapier')
  })

  it('respects "we use this" confirmation', () => {
    const flags = flagsOf(monthly('ZAPIER.COM/CHARGE', 2999, 10), ['Zapier'])
    expect(flags.filter((f) => f.type === 'ZOMBIE')).toHaveLength(0)
  })

  it('gives young subscriptions the benefit of the doubt', () => {
    const flags = flagsOf(monthly('ZAPIER.COM/CHARGE', 2999, 4))
    expect(flags.filter((f) => f.type === 'ZOMBIE')).toHaveLength(0)
  })
})

describe('PRICE_HIKE', () => {
  it('fires on a >8% increase between charges', () => {
    const charges = [
      ...Array.from({ length: 4 }, (_, i) => tx(15 + i * 30, 5999, 'ADOBE *CREATIVE CLOUD')),
      ...Array.from({ length: 8 }, (_, i) => tx(135 + i * 30, 5499, 'ADOBE *CREATIVE CLOUD')),
    ]
    const flags = flagsOf(charges, ['Adobe Creative Cloud'])
    const hikes = flags.filter((f) => f.type === 'PRICE_HIKE')
    expect(hikes).toHaveLength(1)
    expect(hikes[0]!.estimatedAnnualSavingsCents).toBe((5999 - 5499) * 12)
    expect(hikes[0]!.dedupeKey).toBe('PRICE_HIKE:5499:5999')
  })

  it('fires even when the hike exceeds the 15% cluster band', () => {
    // $25 → $29 (+16%): sequential clusters must merge into one subscription
    const charges = [
      ...[14, 44].map((d) => tx(d, 2900, 'PAGERDUTY INC SAN FRANCISCO')),
      ...[74, 104, 134, 164, 194, 224, 254, 284].map((d) => tx(d, 2500, 'PAGERDUTY INC SAN FRANCISCO')),
    ]
    const flags = flagsOf(charges, ['PagerDuty'])
    const hikes = flags.filter((f) => f.type === 'PRICE_HIKE')
    expect(hikes).toHaveLength(1)
    expect(hikes[0]!.dedupeKey).toBe('PRICE_HIKE:2500:2900')
    // and it must NOT be misread as a duplicate plan
    expect(flags.filter((f) => f.type === 'DUPLICATE')).toHaveLength(0)
  })

  it('never fires for variable usage billing (AWS-style)', () => {
    const amounts = [21000, 27500, 24100, 29800, 22400, 30000, 25900, 21500, 28700, 23300, 26800, 29100]
    const charges = amounts.map((amt, i) => tx(10 + i * 30, amt, 'AMAZON WEB SERVICES AWS.AMAZON.CO'))
    const flags = flagsOf(charges, ['Amazon Web Services'])
    expect(flags.filter((f) => f.type === 'PRICE_HIKE')).toHaveLength(0)
  })

  it('stays quiet under 8%', () => {
    const charges = [
      ...Array.from({ length: 4 }, (_, i) => tx(15 + i * 30, 5799, 'ADOBE *CREATIVE CLOUD')),
      ...Array.from({ length: 8 }, (_, i) => tx(135 + i * 30, 5499, 'ADOBE *CREATIVE CLOUD')),
    ]
    const flags = flagsOf(charges, ['Adobe Creative Cloud'])
    expect(flags.filter((f) => f.type === 'PRICE_HIKE')).toHaveLength(0)
  })
})

describe('TRIAL_CONVERTED', () => {
  it('fires when a $1 charge precedes the first real charge', () => {
    // trial 130 days ago, real charges start 116 days ago (oldest = 116+3*30)
    const flags = flagsOf(
      [tx(130, 100, 'HUBSPOT INC.'), ...[116, 86, 56, 26].map((d) => tx(d, 4500, 'HUBSPOT INC.'))],
      ['HubSpot'],
    )
    const trials = flags.filter((f) => f.type === 'TRIAL_CONVERTED')
    expect(trials).toHaveLength(1)
    expect(trials[0]!.explanation).toContain('HubSpot')
  })

  it('fires for a genuine $0.00 trial that converts to real billing', () => {
    // The product promises "$0/$1 charge" detection — $0 must work, not
    // just $1. $0 rows are kept through ingestion and reach this detector.
    const flags = flagsOf(
      [tx(130, 0, 'NOTION LABS, INC.'), ...[116, 86, 56, 26].map((d) => tx(d, 3000, 'NOTION LABS, INC.'))],
      ['Notion'],
    )
    const trials = flags.filter((f) => f.type === 'TRIAL_CONVERTED')
    expect(trials).toHaveLength(1)
    expect(trials[0]!.explanation).toContain('Notion')
    // and the $0 row never becomes its own subscription
    expect(
      runDetection(
        [tx(130, 0, 'NOTION LABS, INC.'), ...[116, 86, 56, 26].map((d) => tx(d, 3000, 'NOTION LABS, INC.'))],
        { now: NOW, confirmedMerchants: new Set(['Notion']) },
      ).subscriptions.filter((s) => s.currentAmountCents === 0),
    ).toHaveLength(0)
  })

  it('ignores trial charges more than 60 days before the subscription', () => {
    const flags = flagsOf(
      [tx(300, 100, 'HUBSPOT INC.'), ...[116, 86, 56, 26].map((d) => tx(d, 4500, 'HUBSPOT INC.'))],
      ['HubSpot'],
    )
    expect(flags.filter((f) => f.type === 'TRIAL_CONVERTED')).toHaveLength(0)
  })
})

describe('FORGOTTEN_ANNUAL', () => {
  it('fires when an annual renewal is within 30 days', () => {
    const flags = flagsOf(
      [tx(710, 21600, 'SQSP* INV1 NEW YORK'), tx(345, 21600, 'SQSP* INV2 NEW YORK')],
      ['Squarespace'],
    )
    const annual = flags.filter((f) => f.type === 'FORGOTTEN_ANNUAL')
    expect(annual).toHaveLength(1)
    expect(annual[0]!.estimatedAnnualSavingsCents).toBe(21600)
    expect(annual[0]!.explanation).toMatch(/in \d+ days?/)
  })

  it('stays quiet when renewal is months away', () => {
    const flags = flagsOf(
      [tx(490, 8900, 'GODADDY.COM #1'), tx(125, 8900, 'GODADDY.COM #2')],
      ['GoDaddy'],
    )
    expect(flags.filter((f) => f.type === 'FORGOTTEN_ANNUAL')).toHaveLength(0)
  })
})

describe('flag hygiene', () => {
  it('every flag carries an explanation and non-negative savings', () => {
    const flags = flagsOf([
      ...monthly('ZAPIER.COM/CHARGE', 2999, 10),
      ...monthly('DROPBOX*AAA', 1999, 10),
      ...monthly('DROPBOX INTL BBB', 2400, 6),
    ])
    expect(flags.length).toBeGreaterThan(0)
    for (const flag of flags) {
      expect(flag.explanation.length).toBeGreaterThan(20)
      expect(flag.estimatedAnnualSavingsCents).toBeGreaterThanOrEqual(0)
      expect(flag.dedupeKey.length).toBeGreaterThan(0)
    }
  })
})
