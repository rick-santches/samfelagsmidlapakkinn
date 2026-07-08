/**
 * Demo fixture data: ~18 months of realistic small-business card
 * transactions for the seeded demo org. Engineered so the detection
 * engine produces at least one of every flag type:
 *
 *   DUPLICATE        — two Dropbox plans running side by side
 *   OVERLAP          — Zoom + Google Meet (video-conferencing), Notion + Confluence (project-mgmt)
 *   ZOMBIE           — Zapier + LinkedIn Premium, months old, never confirmed in review
 *   PRICE_HIKE       — Adobe Creative Cloud jumps 54.99 → 59.99 (+9.1%)
 *   TRIAL_CONVERTED  — HubSpot $1 trial charge, then $45/mo
 *   FORGOTTEN_ANNUAL — Squarespace annual renewal lands within 30 days
 *
 * All dates are relative to `now` so the demo is always fresh.
 * Jitter is deterministic (tiny LCG) so re-seeding is stable.
 */

export interface FixtureTransaction {
  date: Date
  amountCents: number
  rawDescription: string
}

function lcg(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function daysAgo(now: Date, days: number): Date {
  const d = new Date(now)
  d.setUTCDate(d.getUTCDate() - Math.round(days))
  d.setUTCHours(0, 0, 0, 0)
  return d
}

interface RecurringSpec {
  descriptor: string
  amountCents: number
  /** days between charges */
  intervalDays: number
  /** how many days ago the FIRST charge happened */
  startDaysAgo: number
  /** stop charging this many days ago (0 = still active) */
  endDaysAgo?: number
  /** max random jitter in days applied to each charge date */
  jitterDays?: number
  /** override amount for specific charge indexes (price hikes, trials) */
  amountOverrides?: Record<number, number>
}

function recurring(spec: RecurringSpec, now: Date, rand: () => number): FixtureTransaction[] {
  const out: FixtureTransaction[] = []
  const end = spec.endDaysAgo ?? 0
  let i = 0
  for (let ago = spec.startDaysAgo; ago >= end; ago -= spec.intervalDays, i++) {
    const jitter = spec.jitterDays ? (rand() * 2 - 1) * spec.jitterDays : 0
    out.push({
      date: daysAgo(now, ago + jitter),
      amountCents: spec.amountOverrides?.[i] ?? spec.amountCents,
      rawDescription: spec.descriptor,
    })
  }
  return out
}

export function buildFixtureTransactions(now: Date): FixtureTransaction[] {
  const rand = lcg(20260708)
  const tx: FixtureTransaction[] = []
  const add = (spec: RecurringSpec) => tx.push(...recurring(spec, now, rand))

  // ── Healthy, in-use SaaS stack (confirmed in review → no zombie flags) ──
  add({ descriptor: 'SLACK T019XW2LQ SLACK.COM', amountCents: 8750, intervalDays: 30, startDaysAgo: 540, jitterDays: 2 })
  add({ descriptor: 'GITHUB* INC 8886366145', amountCents: 4400, intervalDays: 30, startDaysAgo: 540, jitterDays: 1 })
  add({ descriptor: 'GOOGLE *GSUITE ZOMBLYDEMO', amountCents: 7200, intervalDays: 30, startDaysAgo: 540, jitterDays: 1 })
  add({ descriptor: 'FIGMA MONTHLY RENEWAL', amountCents: 4500, intervalDays: 30, startDaysAgo: 420, jitterDays: 2 })
  add({ descriptor: 'INTUIT *QBooks Online', amountCents: 3500, intervalDays: 30, startDaysAgo: 510, jitterDays: 2 })
  add({ descriptor: 'CANVA* 04531-2298 SINGAPORE', amountCents: 1299, intervalDays: 30, startDaysAgo: 330, jitterDays: 2 })
  add({ descriptor: 'OPENAI *CHATGPT SUBSCR', amountCents: 6000, intervalDays: 30, startDaysAgo: 390, jitterDays: 1 })
  add({ descriptor: 'ANTHROPIC, PBC SAN FRANCISCO', amountCents: 2500, intervalDays: 30, startDaysAgo: 240, jitterDays: 1 })
  add({ descriptor: '1PASSWORD 888-303-1369', amountCents: 799, intervalDays: 30, startDaysAgo: 480, jitterDays: 1 })
  add({ descriptor: 'MSFT*M365 BUSINESS STD', amountCents: 12500, intervalDays: 30, startDaysAgo: 540, jitterDays: 1 })

  // AWS — variable amounts, monthly-ish → detected but lower confidence
  for (let m = 17; m >= 0; m--) {
    tx.push({
      date: daysAgo(now, m * 30 + 3 + rand() * 3),
      amountCents: Math.round(21000 + rand() * 9000),
      rawDescription: 'AMAZON WEB SERVICES AWS.AMAZON.CO',
    })
  }

  // ── DUPLICATE: two Dropbox plans, overlapping the last 7 months ──
  add({ descriptor: 'DROPBOX*8H2K1PQRS7T4', amountCents: 1999, intervalDays: 30, startDaysAgo: 540, jitterDays: 2 })
  add({ descriptor: 'DROPBOX INTL RENEWAL DUBLIN', amountCents: 2400, intervalDays: 30, startDaysAgo: 210, jitterDays: 2 })

  // ── OVERLAP pair 1 (video-conferencing): Zoom + Google Meet ──
  add({ descriptor: 'ZOOM.US 888-799-9666 WWW.ZOOM.U', amountCents: 1599, intervalDays: 30, startDaysAgo: 540, jitterDays: 2 })
  add({ descriptor: 'GOOGLE *MEET PREMIUM', amountCents: 1200, intervalDays: 30, startDaysAgo: 270, jitterDays: 2 })

  // ── OVERLAP pair 2 (project-mgmt): Notion + Confluence ──
  add({ descriptor: 'NOTION LABS, INC. NOTION.SO', amountCents: 3000, intervalDays: 30, startDaysAgo: 450, jitterDays: 2 })
  add({ descriptor: 'ATLASSIAN* CONFLUENCE CLOUD', amountCents: 2750, intervalDays: 30, startDaysAgo: 300, jitterDays: 2 })

  // ── ZOMBIE: quietly billing for 9+ months, never confirmed ──
  add({ descriptor: 'ZAPIER.COM/CHARGE 866-9070364', amountCents: 2999, intervalDays: 30, startDaysAgo: 300, jitterDays: 1 })
  add({ descriptor: 'LINKEDIN PRE 855-6535653', amountCents: 5999, intervalDays: 30, startDaysAgo: 390, jitterDays: 2 })

  // ── PRICE_HIKE: Adobe 54.99 → 59.99 (+9.1%) four months ago ──
  const adobeCharges = 18
  const adobeOverrides: Record<number, number> = {}
  for (let i = 0; i < adobeCharges; i++) {
    // first charge is index 0 (oldest); hike kicks in on the 14th charge
    adobeOverrides[i] = i >= 14 ? 5999 : 5499
  }
  add({
    descriptor: 'ADOBE *CREATIVE CLOUD 4085366000',
    amountCents: 5499,
    intervalDays: 30,
    startDaysAgo: 530,
    jitterDays: 1,
    amountOverrides: adobeOverrides,
  })

  // ── TRIAL_CONVERTED: HubSpot $1 trial, then $45/mo ──
  tx.push({ date: daysAgo(now, 130), amountCents: 100, rawDescription: 'HUBSPOT INC. CAMBRIDGE MA' })
  add({ descriptor: 'HUBSPOT INC. CAMBRIDGE MA', amountCents: 4500, intervalDays: 30, startDaysAgo: 116, jitterDays: 1 })

  // ── FORGOTTEN_ANNUAL: Squarespace annual, renewal ~20 days out ──
  tx.push({ date: daysAgo(now, 710), amountCents: 21600, rawDescription: 'SQSP* INV73920481 NEW YORK' })
  tx.push({ date: daysAgo(now, 345), amountCents: 21600, rawDescription: 'SQSP* INV91055372 NEW YORK' })

  // Second annual for realism: domain renewal, but far from renewal date
  tx.push({ date: daysAgo(now, 490), amountCents: 8900, rawDescription: 'GODADDY.COM #34118 480-5058855' })
  tx.push({ date: daysAgo(now, 125), amountCents: 8900, rawDescription: 'GODADDY.COM #58230 480-5058855' })

  // ── One-off noise: must NOT become subscriptions ──
  const noise: Array<[number, number, string]> = [
    [512, 12483, 'AMAZON MKTPL*RT4Y88 SEATTLE WA'],
    [493, 3410, 'UBER TRIP HELP.UBER.COM'],
    [471, 8900, 'DELTA AIR 0062341998877'],
    [455, 2350, 'DOORDASH*CHIPOTLE SAN FRANCISCO'],
    [430, 45000, 'DELL MARKETING L.P. ROUND ROCK'],
    [402, 1799, 'AMZN MKTP US*Z449L1 AMZN.COM'],
    [381, 5620, 'MARRIOTT COURTYARD AUSTIN TX'],
    [350, 4200, 'OFFICE DEPOT #1123 PORTLAND OR'],
    [311, 990, 'STARBUCKS STORE 10281 SEATTLE'],
    [64, 780, 'STARBUCKS STORE 10281 SEATTLE'],
    [288, 15975, 'UNITED AIRLINES 0162399887744'],
    [255, 2299, 'AMAZON MKTPL*88YHG2 SEATTLE WA'],
    [222, 6750, 'LYFT *3 RIDES 855-865-9553'],
    [190, 33000, 'APPLE STORE #R121 PALO ALTO CA'],
    [156, 1250, 'DOORDASH*SWEETGREEN SAN FRANCI'],
    [122, 9450, 'HILTON GARDEN INN DENVER CO'],
    [88, 2100, 'UBER TRIP HELP.UBER.COM'],
    [41, 5300, 'AMAZON MKTPL*QQ12MN SEATTLE WA'],
    [18, 1560, 'DOORDASH*PANERA SAN FRANCISCO'],
    [7, 3200, 'UBER TRIP HELP.UBER.COM'],
  ]
  for (const [ago, cents, desc] of noise) {
    tx.push({ date: daysAgo(now, ago), amountCents: cents, rawDescription: desc })
  }

  tx.sort((a, b) => a.date.getTime() - b.date.getTime())
  return tx
}

/** Merchants the demo user has already confirmed as "we use this" in review. */
export const CONFIRMED_MERCHANTS = [
  'Slack',
  'GitHub',
  'Google Workspace',
  'Figma',
  'QuickBooks',
  'Canva',
  'OpenAI',
  'Anthropic',
  '1Password',
  'Microsoft 365',
  'Amazon Web Services',
  'Adobe Creative Cloud',
  'HubSpot',
  'Squarespace',
  'GoDaddy',
  'Zoom',
  'Notion',
  'Dropbox',
]
