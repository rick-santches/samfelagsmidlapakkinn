import { describe, expect, it } from 'vitest'
import { heuristicClean, normalizeMerchant } from '../normalize'

describe('normalizeMerchant — dictionary matches', () => {
  const cases: Array<[raw: string, merchant: string, category: string]> = [
    ['GITHUB* INC 8886366145', 'GitHub', 'dev-tools'],
    ['MSFT*M365 BUSINESS STD', 'Microsoft 365', 'productivity'],
    ['GOOGLE *GSUITE ZOMBLYDEMO', 'Google Workspace', 'productivity'],
    ['GOOGLE *MEET PREMIUM', 'Google Meet', 'video-conferencing'],
    ['ZOOM.US 888-799-9666 WWW.ZOOM.U', 'Zoom', 'video-conferencing'],
    ['SLACK T019XW2LQ SLACK.COM', 'Slack', 'communication'],
    ['DROPBOX*8H2K1PQRS7T4', 'Dropbox', 'storage'],
    ['ADOBE *CREATIVE CLOUD 4085366000', 'Adobe Creative Cloud', 'design'],
    ['INTUIT *QBOOKS ONLINE', 'QuickBooks', 'accounting'],
    ['SQSP* INV73920481 NEW YORK', 'Squarespace', 'hosting'],
    ['ATLASSIAN* CONFLUENCE CLOUD', 'Confluence', 'project-mgmt'],
    ['NOTION LABS, INC. NOTION.SO', 'Notion', 'project-mgmt'],
    ['AMAZON WEB SERVICES AWS.AMAZON.CO', 'Amazon Web Services', 'hosting'],
    ['OPENAI *CHATGPT SUBSCR', 'OpenAI', 'ai-tools'],
    ['ANTHROPIC, PBC SAN FRANCISCO', 'Anthropic', 'ai-tools'],
    ['HUBSPOT INC. CAMBRIDGE MA', 'HubSpot', 'crm'],
    ['LINKEDIN PRE 855-6535653', 'LinkedIn', 'hr'],
    ['ZAPIER.COM/CHARGE 866-9070364', 'Zapier', 'productivity'],
    ['GODADDY.COM #34118 480-5058855', 'GoDaddy', 'domains'],
    ['DNH*GODADDY.COM 480-505-8855', 'GoDaddy', 'domains'],
    ['1PASSWORD 888-303-1369', '1Password', 'security'],
    ['CANVA* 04531-2298 SINGAPORE', 'Canva', 'design'],
    ['INTUIT *MAILCHIMP', 'Mailchimp', 'email-marketing'],
    ['GITHUB COPILOT SUBSCRIPTION', 'GitHub Copilot', 'ai-tools'],
  ]

  it.each(cases)('%s → %s', (raw, merchant, category) => {
    const result = normalizeMerchant(raw)
    expect(result.merchant).toBe(merchant)
    expect(result.category).toBe(category)
    expect(result.matched).toBe(true)
    expect(result.domain).toBeTruthy()
  })

  it('does not confuse ZoomInfo with Zoom', () => {
    expect(normalizeMerchant('ZOOMINFO TECHNOLOGIES').merchant).toBe('ZoomInfo')
  })

  it('does not confuse Amazon retail with AWS', () => {
    const result = normalizeMerchant('AMAZON MKTPL*RT4Y88 SEATTLE WA')
    expect(result.matched).toBe(false)
  })

  it('does not match an Apple Store hardware purchase to Apple subscriptions', () => {
    expect(normalizeMerchant('APPLE STORE #R121 PALO ALTO CA').matched).toBe(false)
  })

  it('flags commonly-forgotten merchants', () => {
    expect(normalizeMerchant('LINKEDIN PRE 855-6535653').commonlyForgotten).toBe(true)
    expect(normalizeMerchant('SLACK T019XW2LQ SLACK.COM').commonlyForgotten).toBe(false)
  })
})

describe('heuristicClean — unknown descriptors', () => {
  it('strips processor prefixes', () => {
    expect(heuristicClean('SQ *BLUE BOTTLE COFFEE')).toBe('Blue Bottle Coffee')
    expect(heuristicClean('PAYPAL *ACMEWIDGETS')).toBe('Acmewidgets')
    expect(heuristicClean('TST* JOES DINER')).toBe('Joes Diner')
  })

  it('strips phone numbers, reference codes, and store numbers', () => {
    expect(heuristicClean('WIDGETCO 888-555-1234')).toBe('Widgetco')
    expect(heuristicClean('OFFICE DEPOT #1123 PORTLAND OR')).toBe('Office Depot')
  })

  it('strips trailing city/state', () => {
    expect(heuristicClean('MARRIOTT COURTYARD AUSTIN TX')).toBe('Marriott Courtyard')
  })

  it('never returns an empty string', () => {
    expect(heuristicClean('#123456').length).toBeGreaterThan(0)
  })
})
