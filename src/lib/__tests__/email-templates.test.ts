import { describe, expect, it } from 'vitest'
import { instantFlagEmail, weeklyDigestEmail } from '../email-templates'

describe('email HTML escaping', () => {
  it('escapes markup in a merchant-derived instant alert', () => {
    const { html, text } = instantFlagEmail({
      orgName: 'Acme',
      flagType: 'PRICE_HIKE',
      merchantName: '<a href="https://evil.ex">CLICK</a>',
      explanation: 'Sneaky <script>alert(1)</script> hike',
      estimatedAnnualSavingsCents: 4800,
    })
    expect(html).not.toContain('<a href="https://evil.ex">')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;a href=')
    expect(html).toContain('&lt;script&gt;')
    // Plain-text part is not HTML and carries the raw explanation
    expect(text).toContain('<script>')
  })

  it('escapes markup in digest merchant names and org name', () => {
    const { html } = weeklyDigestEmail({
      orgName: 'Acme <b>Co</b>',
      newSubscriptions: [{ merchantName: '<img src=x onerror=1>', amountLabel: '$10/mo' }],
      upcomingRenewals: [],
      newFlags: [],
      totalFlaggedSavingsCents: 0,
    })
    expect(html).not.toContain('<img src=x')
    expect(html).not.toContain('<b>Co</b>')
    expect(html).toContain('&lt;img src=x')
  })
})
