/**
 * How to actually cancel each merchant — the Kill List's receipts.
 * Difficulty is honest: some vendors bury the cancel button.
 */
export type CancelDifficulty = 'easy' | 'medium' | 'painful'

export interface CancellationInfo {
  url: string
  difficulty: CancelDifficulty
  note: string
}

const KNOWN: Record<string, CancellationInfo> = {
  Slack: { url: 'https://slack.com/help/articles/204457437', difficulty: 'easy', note: 'Workspace admin → Billing → change plan.' },
  Zoom: { url: 'https://zoom.us/billing', difficulty: 'easy', note: 'Admin → Account Management → Billing → cancel plan.' },
  'Google Meet': { url: 'https://admin.google.com', difficulty: 'medium', note: 'Bundled with Workspace — downgrade the Workspace SKU instead.' },
  Dropbox: { url: 'https://www.dropbox.com/account/plan', difficulty: 'easy', note: 'Settings → Plan → cancel. Downloads keep working until period end.' },
  Notion: { url: 'https://www.notion.so/my-account', difficulty: 'easy', note: 'Settings → Billing → change plan.' },
  Confluence: { url: 'https://admin.atlassian.com', difficulty: 'medium', note: 'Atlassian admin → Billing → manage subscriptions.' },
  'Adobe Creative Cloud': { url: 'https://account.adobe.com/plans', difficulty: 'painful', note: 'Annual plans charge an early-termination fee after 14 days. Call retention if pushed.' },
  HubSpot: { url: 'https://knowledge.hubspot.com/account/cancel-your-hubspot-subscription', difficulty: 'painful', note: 'Requires written notice before renewal; auto-renews otherwise.' },
  Salesforce: { url: 'https://help.salesforce.com', difficulty: 'painful', note: 'Contract-based — notice usually required 30 days before term end.' },
  Zapier: { url: 'https://zapier.com/app/settings/billing', difficulty: 'easy', note: 'Settings → Billing → downgrade to Free.' },
  LinkedIn: { url: 'https://www.linkedin.com/mypreferences/d/manage-premium', difficulty: 'medium', note: 'Premium hides the cancel link under "Manage subscription".' },
  Squarespace: { url: 'https://account.squarespace.com', difficulty: 'easy', note: 'Settings → Billing → Site subscription → cancel before renewal.' },
  GoDaddy: { url: 'https://account.godaddy.com/subscriptions', difficulty: 'medium', note: 'Turn OFF auto-renew per product; they re-enable it on some upgrades.' },
  Mailchimp: { url: 'https://mailchimp.com/help/close-account/', difficulty: 'medium', note: 'Pause or close — export your audience first.' },
  Datadog: { url: 'https://app.datadoghq.com/billing', difficulty: 'medium', note: 'Downgrade hosts first or the next invoice still bills them.' },
  Sentry: { url: 'https://sentry.io/settings/billing/', difficulty: 'easy', note: 'Settings → Subscription → downgrade to Developer.' },
  Figma: { url: 'https://www.figma.com/settings', difficulty: 'easy', note: 'Admin → Billing → reduce editor seats or cancel.' },
  Canva: { url: 'https://www.canva.com/settings/billing', difficulty: 'easy', note: 'Settings → Billing & plans → cancel Pro.' },
  GitHub: { url: 'https://github.com/settings/billing', difficulty: 'easy', note: 'Org settings → Billing → downgrade seats/plan.' },
  'Microsoft 365': { url: 'https://admin.microsoft.com', difficulty: 'medium', note: 'Admin center → Billing → Your products → cancel before renewal.' },
  'Google Workspace': { url: 'https://admin.google.com', difficulty: 'medium', note: 'Admin console → Billing → cancel subscription per SKU.' },
  QuickBooks: { url: 'https://quickbooks.intuit.com/learn-support/', difficulty: 'medium', note: 'Account settings → Billing → cancel; export your books first.' },
  'Amazon Web Services': { url: 'https://console.aws.amazon.com/billing', difficulty: 'painful', note: 'No single cancel — terminate resources, then close the account.' },
  OpenAI: { url: 'https://platform.openai.com/settings/organization/billing', difficulty: 'easy', note: 'Billing → cancel plan; API keys stop at period end.' },
  Anthropic: { url: 'https://console.anthropic.com/settings/billing', difficulty: 'easy', note: 'Console → Billing → manage plan.' },
  '1Password': { url: 'https://my.1password.com/billing', difficulty: 'easy', note: 'Billing → cancel; vaults go read-only, never deleted.' },
}

const DEFAULT_NOTE: CancellationInfo = {
  url: '',
  difficulty: 'medium',
  note: 'Check the vendor billing page, and confirm the cancellation email arrives — no email, no cancellation.',
}

export function cancellationInfo(merchantName: string): CancellationInfo {
  const known = KNOWN[merchantName]
  if (known) return known
  return {
    ...DEFAULT_NOTE,
    url: `https://www.google.com/search?q=${encodeURIComponent(`cancel ${merchantName} subscription`)}`,
  }
}
