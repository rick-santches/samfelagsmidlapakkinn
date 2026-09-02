import type { Category } from './types'

/**
 * Curated dictionary of ~300 SaaS / subscription merchants as they
 * actually appear in US bank and card statement descriptors.
 *
 * Matching: `patterns` are tested against the UPPERCASED raw descriptor —
 * strings as substring matches, RegExps as-is. Entries are checked in
 * order, so keep specific patterns (GOOGLE *MEET) above generic ones
 * (GOOGLE *). `commonlyForgotten` marks tools people habitually keep
 * paying for after they stop using them.
 */
export interface MerchantEntry {
  name: string
  domain: string
  category: Category
  patterns: ReadonlyArray<string | RegExp>
  commonlyForgotten?: boolean
}

function m(
  name: string,
  domain: string,
  category: Category,
  patterns: ReadonlyArray<string | RegExp>,
  opts?: { forgotten?: boolean },
): MerchantEntry {
  return { name, domain, category, patterns, commonlyForgotten: opts?.forgotten }
}

export const MERCHANT_DICTIONARY: readonly MerchantEntry[] = [
  // ── Google family — specific products before the generic catch-all ──
  m('Google Meet', 'meet.google.com', 'video-conferencing', ['GOOGLE *MEET', 'GOOGLE MEET']),
  m('Google Workspace', 'workspace.google.com', 'productivity', ['GOOGLE *GSUITE', 'GOOGLE *WORKSPACE', 'GOOGLE WORKSPACE', 'GSUITE']),
  m('Google One', 'one.google.com', 'storage', ['GOOGLE *ONE', 'GOOGLE ONE', 'GOOGLE STORAGE'], { forgotten: true }),
  m('Google Ads', 'ads.google.com', 'marketing', ['GOOGLE *ADS', 'GOOGLE ADS', 'GOOGLE ADWORDS', 'ADWORDS']),
  m('Google Cloud', 'cloud.google.com', 'hosting', ['GOOGLE *CLOUD', 'GOOGLE CLOUD', 'GOOGLE *GCP']),
  m('YouTube Premium', 'youtube.com', 'media', ['YOUTUBE PREMIUM', 'GOOGLE *YOUTUBEPREMIUM', 'GOOGLE *YOUTUBE'], { forgotten: true }),
  m('Google Domains', 'domains.google.com', 'domains', ['GOOGLE *DOMAINS', 'GOOGLE DOMAINS'], { forgotten: true }),

  // ── Microsoft family ──
  m('Microsoft 365', 'microsoft.com', 'productivity', ['MSFT*M365', 'MSFT *M365', 'MICROSOFT 365', 'MSFT*OFFICE', 'MICROSOFT*OFFICE', 'MSFT*MICROSOFT 365']),
  m('Microsoft Azure', 'azure.microsoft.com', 'hosting', ['MSFT*AZURE', 'MICROSOFT AZURE', 'MSFT *AZURE']),
  m('LinkedIn', 'linkedin.com', 'hr', ['LINKEDIN', 'LNKD.IN'], { forgotten: true }),
  m('OneDrive', 'onedrive.com', 'storage', ['MSFT*ONEDRIVE', 'ONEDRIVE'], { forgotten: true }),
  m('Skype', 'skype.com', 'video-conferencing', ['SKYPE'], { forgotten: true }),

  // ── Amazon family — AWS before retail noise ──
  m('Amazon Web Services', 'aws.amazon.com', 'hosting', ['AMAZON WEB SERVICES', 'AWS.AMAZON', 'AWS EMEA', /\bAWS\b/]),
  m('Amazon Prime', 'amazon.com', 'media', ['AMAZON PRIME', 'AMZN PRIME', 'PRIME MEMBERSHIP'], { forgotten: true }),
  m('Audible', 'audible.com', 'media', ['AUDIBLE'], { forgotten: true }),
  m('Twitch', 'twitch.tv', 'media', ['TWITCHINTERACT', 'TWITCH.TV'], { forgotten: true }),

  // ── Apple ──
  m('Apple', 'apple.com', 'media', ['APPLE.COM/BILL', 'APL*ITUNES', 'APL* ITUNES', 'APPLE SERVICES'], { forgotten: true }),
  m('iCloud', 'icloud.com', 'storage', ['ICLOUD', 'APL*ICLOUD'], { forgotten: true }),

  // ── Communication / collaboration ──
  m('Slack', 'slack.com', 'communication', ['SLACK']),
  m('Zoom', 'zoom.us', 'video-conferencing', ['ZOOM.US', 'ZOOM VIDEO', 'ZOOM.COM']),
  m('Webex', 'webex.com', 'video-conferencing', ['WEBEX', 'CISCO WEBEX']),
  m('GoTo Meeting', 'goto.com', 'video-conferencing', ['GOTOMEETING', 'GOTO MEETING', 'LOGMEIN*GOTOMEETING', 'GOTO.COM']),
  m('RingCentral', 'ringcentral.com', 'telecom', ['RINGCENTRAL']),
  m('Whereby', 'whereby.com', 'video-conferencing', ['WHEREBY']),
  m('Discord', 'discord.com', 'communication', ['DISCORD'], { forgotten: true }),
  m('Loom', 'loom.com', 'video-conferencing', ['LOOM SUBSCRIPTION', 'LOOM, INC', 'LOOM.COM']),
  m('Vimeo', 'vimeo.com', 'media', ['VIMEO'], { forgotten: true }),
  m('Twilio', 'twilio.com', 'dev-tools', ['TWILIO']),
  m('Superhuman', 'superhuman.com', 'productivity', ['SUPERHUMAN']),
  m('Front', 'front.com', 'communication', ['FRONTAPP', 'FRONT APP']),
  m('Krisp', 'krisp.ai', 'communication', ['KRISP'], { forgotten: true }),
  m('OpenPhone', 'openphone.com', 'telecom', ['OPENPHONE']),
  m('Dialpad', 'dialpad.com', 'telecom', ['DIALPAD']),
  m('Grasshopper', 'grasshopper.com', 'telecom', ['GRASSHOPPER']),
  m('Vonage', 'vonage.com', 'telecom', ['VONAGE']),
  m('8x8', '8x8.com', 'telecom', ['8X8 INC', '8X8.COM']),
  m('Calendly', 'calendly.com', 'productivity', ['CALENDLY']),

  // ── Storage / file sync ──
  m('Dropbox', 'dropbox.com', 'storage', ['DROPBOX'], { forgotten: true }),
  m('Box', 'box.com', 'storage', ['BOX.COM', 'BOX INC', 'BOX* INC']),
  m('Backblaze', 'backblaze.com', 'storage', ['BACKBLAZE']),
  m('pCloud', 'pcloud.com', 'storage', ['PCLOUD'], { forgotten: true }),
  m('Sync.com', 'sync.com', 'storage', ['SYNC.COM']),
  m('IDrive', 'idrive.com', 'storage', ['IDRIVE'], { forgotten: true }),
  m('Egnyte', 'egnyte.com', 'storage', ['EGNYTE']),

  // ── Design / creative ──
  m('Adobe Creative Cloud', 'adobe.com', 'design', ['ADOBE *CREATIVE', 'ADOBE CREATIVE', 'ADOBE *ACROPRO', 'ADOBE *PHOTOGPHY', 'ADOBE INC', 'ADOBE SYSTEMS', 'ADOBE *']),
  m('Figma', 'figma.com', 'design', ['FIGMA']),
  m('Canva', 'canva.com', 'design', ['CANVA']),
  m('Sketch', 'sketch.com', 'design', ['SKETCH B.V', 'SKETCH.COM']),
  m('Framer', 'framer.com', 'design', ['FRAMER']),
  m('InVision', 'invisionapp.com', 'design', ['INVISION'], { forgotten: true }),
  m('Affinity', 'affinity.serif.com', 'design', ['AFFINITY', 'SERIF LABS', 'SERIF EUROPE']),
  m('Shutterstock', 'shutterstock.com', 'design', ['SHUTTERSTOCK'], { forgotten: true }),
  m('Adobe Stock', 'stock.adobe.com', 'design', ['ADOBE STOCK'], { forgotten: true }),
  m('Getty Images', 'gettyimages.com', 'design', ['GETTY IMAGES', 'GETTYIMAGES']),
  m('Envato', 'envato.com', 'design', ['ENVATO'], { forgotten: true }),
  m('Freepik', 'freepik.com', 'design', ['FREEPIK'], { forgotten: true }),
  m('Miro', 'miro.com', 'project-mgmt', ['MIRO.COM', 'REALTIMEBOARD', 'MIRO* SUBSCRIPTION']),
  m('Lucidchart', 'lucidchart.com', 'design', ['LUCIDCHART', 'LUCID SOFTWARE'], { forgotten: true }),
  m('Whimsical', 'whimsical.com', 'design', ['WHIMSICAL']),

  // ── Project management / docs ──
  m('Notion', 'notion.so', 'project-mgmt', ['NOTION LABS', 'NOTION.SO', 'NOTION SO']),
  m('Confluence', 'atlassian.com', 'project-mgmt', ['ATLASSIAN* CONFLUENCE', 'ATLASSIAN *CONFLUENCE', 'CONFLUENCE']),
  m('Jira', 'atlassian.com', 'project-mgmt', ['ATLASSIAN* JIRA', 'ATLASSIAN *JIRA', /\bJIRA\b/]),
  m('Atlassian', 'atlassian.com', 'project-mgmt', ['ATLASSIAN']),
  m('Asana', 'asana.com', 'project-mgmt', ['ASANA']),
  m('Trello', 'trello.com', 'project-mgmt', ['TRELLO'], { forgotten: true }),
  m('Monday.com', 'monday.com', 'project-mgmt', ['MONDAY.COM', 'MONDAYCOM']),
  m('ClickUp', 'clickup.com', 'project-mgmt', ['CLICKUP']),
  m('Basecamp', 'basecamp.com', 'project-mgmt', ['BASECAMP', '37SIGNALS']),
  m('Linear', 'linear.app', 'project-mgmt', ['LINEAR.APP', 'LINEAR ORBIT']),
  m('Airtable', 'airtable.com', 'project-mgmt', ['AIRTABLE']),
  m('Smartsheet', 'smartsheet.com', 'project-mgmt', ['SMARTSHEET']),
  m('Wrike', 'wrike.com', 'project-mgmt', ['WRIKE']),
  m('Todoist', 'todoist.com', 'productivity', ['TODOIST', 'DOIST'], { forgotten: true }),
  m('Coda', 'coda.io', 'project-mgmt', ['CODA.IO']),
  m('Evernote', 'evernote.com', 'productivity', ['EVERNOTE'], { forgotten: true }),

  // ── CRM / sales ──
  m('Salesforce', 'salesforce.com', 'crm', ['SALESFORCE']),
  m('HubSpot', 'hubspot.com', 'crm', ['HUBSPOT']),
  m('Pipedrive', 'pipedrive.com', 'crm', ['PIPEDRIVE']),
  m('Zoho', 'zoho.com', 'crm', ['ZOHO']),
  m('Close', 'close.com', 'crm', ['CLOSE.COM', 'CLOSE.IO']),
  m('Copper', 'copper.com', 'crm', ['COPPER CRM', 'PROSPERWORKS']),
  m('Freshsales', 'freshworks.com', 'crm', ['FRESHSALES', 'FRESHWORKS']),
  m('Insightly', 'insightly.com', 'crm', ['INSIGHTLY']),
  m('Keap', 'keap.com', 'crm', ['KEAP', 'INFUSIONSOFT']),
  m('Attio', 'attio.com', 'crm', ['ATTIO']),
  m('Apollo.io', 'apollo.io', 'crm', ['APOLLO.IO', 'APOLLO IO']),
  m('Outreach', 'outreach.io', 'crm', ['OUTREACH.IO', 'OUTREACH IO']),
  m('ZoomInfo', 'zoominfo.com', 'crm', ['ZOOMINFO']),
  m('Gong', 'gong.io', 'crm', ['GONG.IO', 'GONG IO']),

  // ── Email marketing / comms marketing ──
  m('Mailchimp', 'mailchimp.com', 'email-marketing', ['MAILCHIMP', 'INTUIT *MAILCHIMP'], { forgotten: true }),
  m('Klaviyo', 'klaviyo.com', 'email-marketing', ['KLAVIYO']),
  m('Constant Contact', 'constantcontact.com', 'email-marketing', ['CONSTANT CONTACT', 'CTCT'], { forgotten: true }),
  m('ConvertKit', 'convertkit.com', 'email-marketing', ['CONVERTKIT', 'KIT.COM NEWSLETTER']),
  m('ActiveCampaign', 'activecampaign.com', 'email-marketing', ['ACTIVECAMPAIGN', 'ACTIVE CAMPAIGN']),
  m('Campaign Monitor', 'campaignmonitor.com', 'email-marketing', ['CAMPAIGN MONITOR', 'CAMPAIGNMONITOR']),
  m('Drip', 'drip.com', 'email-marketing', ['DRIP.COM', 'DRIP MARKETING']),
  m('MailerLite', 'mailerlite.com', 'email-marketing', ['MAILERLITE'], { forgotten: true }),
  m('Brevo', 'brevo.com', 'email-marketing', ['BREVO', 'SENDINBLUE']),
  m('Beehiiv', 'beehiiv.com', 'email-marketing', ['BEEHIIV']),
  m('Substack', 'substack.com', 'media', ['SUBSTACK'], { forgotten: true }),
  m('SendGrid', 'sendgrid.com', 'dev-tools', ['SENDGRID', 'TWILIO SENDGRID']),
  m('Mailgun', 'mailgun.com', 'dev-tools', ['MAILGUN']),
  m('Postmark', 'postmarkapp.com', 'dev-tools', ['POSTMARK']),
  m('Resend', 'resend.com', 'dev-tools', ['RESEND.COM', 'RESEND INC']),
  m('Loops', 'loops.so', 'email-marketing', ['LOOPS.SO']),

  // ── Accounting / finance / expense ──
  m('QuickBooks', 'quickbooks.intuit.com', 'accounting', ['INTUIT *QBOOKS', 'INTUIT *QUICKBOOKS', 'QUICKBOOKS', 'QBOOKS ONLINE', 'INTUIT QBOOKS']),
  m('Xero', 'xero.com', 'accounting', ['XERO']),
  m('FreshBooks', 'freshbooks.com', 'accounting', ['FRESHBOOKS', '2NDSITE FRESHBOOKS']),
  m('Wave', 'waveapps.com', 'accounting', ['WAVE APPS', 'WAVEAPPS']),
  m('Bench', 'bench.co', 'accounting', ['BENCH ACCOUNTING', 'BENCH.CO']),
  m('Bill.com', 'bill.com', 'accounting', ['BILL.COM', 'BILL COM']),
  m('Expensify', 'expensify.com', 'accounting', ['EXPENSIFY'], { forgotten: true }),
  m('Sage', 'sage.com', 'accounting', ['SAGE SOFTWARE', 'SAGE.COM', 'SAGE US']),
  m('Avalara', 'avalara.com', 'accounting', ['AVALARA']),
  m('TaxJar', 'taxjar.com', 'accounting', ['TAXJAR']),
  m('Pilot', 'pilot.com', 'accounting', ['PILOT.COM', 'PILOT BOOKKEEPING']),
  m('Melio', 'melio.com', 'accounting', ['MELIO']),
  m('Stripe', 'stripe.com', 'payments', ['STRIPE']),
  m('Square', 'squareup.com', 'payments', [/\bSQUAREUP\b/, 'SQUARE INC']),
  m('PayPal', 'paypal.com', 'payments', ['PAYPAL *SUBSCR', 'PAYPAL SUBSCRIPTION']),
  m('Chargebee', 'chargebee.com', 'payments', ['CHARGEBEE']),
  m('Recurly', 'recurly.com', 'payments', ['RECURLY']),

  // ── AI tools ──
  m('OpenAI', 'openai.com', 'ai-tools', ['OPENAI', 'CHATGPT']),
  m('Anthropic', 'anthropic.com', 'ai-tools', ['ANTHROPIC', 'CLAUDE.AI']),
  m('Midjourney', 'midjourney.com', 'ai-tools', ['MIDJOURNEY'], { forgotten: true }),
  m('Perplexity', 'perplexity.ai', 'ai-tools', ['PERPLEXITY']),
  m('Jasper', 'jasper.ai', 'ai-tools', ['JASPER.AI', 'JASPER AI'], { forgotten: true }),
  m('Copy.ai', 'copy.ai', 'ai-tools', ['COPY.AI', 'COPYAI'], { forgotten: true }),
  m('Runway', 'runwayml.com', 'ai-tools', ['RUNWAYML', 'RUNWAY ML'], { forgotten: true }),
  m('ElevenLabs', 'elevenlabs.io', 'ai-tools', ['ELEVENLABS', 'ELEVEN LABS']),
  m('Grammarly', 'grammarly.com', 'ai-tools', ['GRAMMARLY'], { forgotten: true }),
  m('Otter.ai', 'otter.ai', 'ai-tools', ['OTTER.AI', 'OTTERAI'], { forgotten: true }),
  m('Fireflies', 'fireflies.ai', 'ai-tools', ['FIREFLIES'], { forgotten: true }),
  m('Descript', 'descript.com', 'ai-tools', ['DESCRIPT'], { forgotten: true }),
  m('Synthesia', 'synthesia.io', 'ai-tools', ['SYNTHESIA']),
  m('Cursor', 'cursor.com', 'ai-tools', ['CURSOR AI', 'CURSOR.COM', 'CURSOR, AI', 'ANYSPHERE']),
  m('Replit', 'replit.com', 'dev-tools', ['REPLIT']),
  m('GitHub Copilot', 'github.com', 'ai-tools', ['GITHUB COPILOT']),
  m('Gamma', 'gamma.app', 'ai-tools', ['GAMMA.APP', 'GAMMA APP']),

  // ── Hosting / infra / websites ──
  m('Vercel', 'vercel.com', 'hosting', ['VERCEL']),
  m('Netlify', 'netlify.com', 'hosting', ['NETLIFY']),
  m('Heroku', 'heroku.com', 'hosting', ['HEROKU'], { forgotten: true }),
  m('DigitalOcean', 'digitalocean.com', 'hosting', ['DIGITALOCEAN', 'DIGITAL OCEAN']),
  m('Linode', 'linode.com', 'hosting', ['LINODE', 'AKAMAI *LINODE']),
  m('Render', 'render.com', 'hosting', ['RENDER.COM']),
  m('Fly.io', 'fly.io', 'hosting', ['FLY.IO']),
  m('Railway', 'railway.app', 'hosting', ['RAILWAY.APP', 'RAILWAY CORP']),
  m('Cloudflare', 'cloudflare.com', 'hosting', ['CLOUDFLARE']),
  m('Fastly', 'fastly.com', 'hosting', ['FASTLY']),
  m('WP Engine', 'wpengine.com', 'hosting', ['WP ENGINE', 'WPENGINE']),
  m('Kinsta', 'kinsta.com', 'hosting', ['KINSTA']),
  m('Bluehost', 'bluehost.com', 'hosting', ['BLUEHOST'], { forgotten: true }),
  m('HostGator', 'hostgator.com', 'hosting', ['HOSTGATOR'], { forgotten: true }),
  m('SiteGround', 'siteground.com', 'hosting', ['SITEGROUND'], { forgotten: true }),
  m('DreamHost', 'dreamhost.com', 'hosting', ['DREAMHOST'], { forgotten: true }),
  m('Squarespace', 'squarespace.com', 'hosting', ['SQUARESPACE', 'SQSP*', 'SQSP *'], { forgotten: true }),
  m('Wix', 'wix.com', 'hosting', ['WIX.COM', 'WIX *'], { forgotten: true }),
  m('Webflow', 'webflow.com', 'hosting', ['WEBFLOW']),
  m('Shopify', 'shopify.com', 'e-commerce', ['SHOPIFY']),
  m('BigCommerce', 'bigcommerce.com', 'e-commerce', ['BIGCOMMERCE']),
  m('WooCommerce', 'woocommerce.com', 'e-commerce', ['WOOCOMMERCE']),
  m('Gumroad', 'gumroad.com', 'e-commerce', ['GUMROAD']),
  m('Etsy', 'etsy.com', 'e-commerce', ['ETSY SUBSCRIPTION', 'ETSY PLUS']),
  m('GoDaddy', 'godaddy.com', 'domains', ['GODADDY', 'GO DADDY', 'DNH*GODADDY'], { forgotten: true }),
  m('Namecheap', 'namecheap.com', 'domains', ['NAMECHEAP'], { forgotten: true }),
  m('Hover', 'hover.com', 'domains', ['HOVER.COM', 'TUCOWS'], { forgotten: true }),
  m('Porkbun', 'porkbun.com', 'domains', ['PORKBUN'], { forgotten: true }),
  m('Network Solutions', 'networksolutions.com', 'domains', ['NETWORK SOLUTIONS', 'NETSOL'], { forgotten: true }),

  // ── Dev tools / data ──
  m('GitHub', 'github.com', 'dev-tools', ['GITHUB']),
  m('GitLab', 'gitlab.com', 'dev-tools', ['GITLAB']),
  m('Bitbucket', 'bitbucket.org', 'dev-tools', ['BITBUCKET', 'ATLASSIAN* BITBUCKET']),
  m('npm', 'npmjs.com', 'dev-tools', ['NPM INC', 'NPMJS']),
  m('Docker', 'docker.com', 'dev-tools', ['DOCKER INC', 'DOCKER.COM']),
  m('JetBrains', 'jetbrains.com', 'dev-tools', ['JETBRAINS']),
  m('Postman', 'postman.com', 'dev-tools', ['POSTMAN']),
  m('CircleCI', 'circleci.com', 'dev-tools', ['CIRCLECI', 'CIRCLE INTERNET']),
  m('Travis CI', 'travis-ci.com', 'dev-tools', ['TRAVIS CI', 'TRAVIS-CI']),
  m('Codecov', 'codecov.io', 'dev-tools', ['CODECOV']),
  m('Sourcegraph', 'sourcegraph.com', 'dev-tools', ['SOURCEGRAPH']),
  m('Retool', 'retool.com', 'dev-tools', ['RETOOL']),
  m('Supabase', 'supabase.com', 'dev-tools', ['SUPABASE']),
  m('PlanetScale', 'planetscale.com', 'dev-tools', ['PLANETSCALE']),
  m('Neon', 'neon.tech', 'dev-tools', ['NEON.TECH', 'NEON DATABASE']),
  m('MongoDB Atlas', 'mongodb.com', 'dev-tools', ['MONGODB', 'MONGO DB']),
  m('Redis', 'redis.io', 'dev-tools', ['REDIS LABS', 'REDIS.COM', 'REDIS INC']),
  m('Algolia', 'algolia.com', 'dev-tools', ['ALGOLIA']),
  m('Auth0', 'auth0.com', 'dev-tools', ['AUTH0']),
  m('Clerk', 'clerk.com', 'dev-tools', ['CLERK.COM', 'CLERK.DEV']),
  m('Firebase', 'firebase.google.com', 'dev-tools', ['FIREBASE']),
  m('Pinecone', 'pinecone.io', 'dev-tools', ['PINECONE']),
  m('Browserstack', 'browserstack.com', 'dev-tools', ['BROWSERSTACK']),
  m('Sauce Labs', 'saucelabs.com', 'dev-tools', ['SAUCE LABS', 'SAUCELABS']),
  m('Cypress', 'cypress.io', 'dev-tools', ['CYPRESS.IO', 'CYPRESS TESTING']),
  m('Figstack', 'figstack.com', 'dev-tools', ['FIGSTACK']),
  m('RapidAPI', 'rapidapi.com', 'dev-tools', ['RAPIDAPI']),
  m('Zapier', 'zapier.com', 'productivity', ['ZAPIER'], { forgotten: true }),
  m('Make', 'make.com', 'productivity', ['MAKE.COM', 'INTEGROMAT'], { forgotten: true }),
  m('IFTTT', 'ifttt.com', 'productivity', ['IFTTT'], { forgotten: true }),
  m('n8n', 'n8n.io', 'productivity', ['N8N.IO', 'N8N CLOUD']),

  // ── Monitoring / observability ──
  m('Datadog', 'datadoghq.com', 'monitoring', ['DATADOG']),
  m('New Relic', 'newrelic.com', 'monitoring', ['NEW RELIC', 'NEWRELIC']),
  m('Sentry', 'sentry.io', 'monitoring', ['SENTRY.IO', 'FUNCTIONAL SOFTWARE SENTRY', 'SENTRY *']),
  m('PagerDuty', 'pagerduty.com', 'monitoring', ['PAGERDUTY']),
  m('Pingdom', 'pingdom.com', 'monitoring', ['PINGDOM'], { forgotten: true }),
  m('UptimeRobot', 'uptimerobot.com', 'monitoring', ['UPTIMEROBOT'], { forgotten: true }),
  m('Grafana', 'grafana.com', 'monitoring', ['GRAFANA']),
  m('LogRocket', 'logrocket.com', 'monitoring', ['LOGROCKET']),
  m('Rollbar', 'rollbar.com', 'monitoring', ['ROLLBAR']),
  m('Statuspage', 'statuspage.io', 'monitoring', ['STATUSPAGE', 'ATLASSIAN* STATUSPAGE']),
  m('Better Stack', 'betterstack.com', 'monitoring', ['BETTER STACK', 'BETTERSTACK', 'BETTER UPTIME']),
  m('Splunk', 'splunk.com', 'monitoring', ['SPLUNK']),
  m('Sumo Logic', 'sumologic.com', 'monitoring', ['SUMO LOGIC', 'SUMOLOGIC']),

  // ── HR / payroll / recruiting ──
  m('Gusto', 'gusto.com', 'hr', ['GUSTO']),
  m('Rippling', 'rippling.com', 'hr', ['RIPPLING']),
  m('BambooHR', 'bamboohr.com', 'hr', ['BAMBOOHR', 'BAMBOO HR']),
  m('Justworks', 'justworks.com', 'hr', ['JUSTWORKS']),
  m('TriNet', 'trinet.com', 'hr', ['TRINET']),
  m('ADP', 'adp.com', 'hr', ['ADP PAYROLL', 'ADP FEES', 'ADP, LLC', 'ADP WORKFORCE']),
  m('Paychex', 'paychex.com', 'hr', ['PAYCHEX']),
  m('Deel', 'deel.com', 'hr', ['DEEL']),
  m('Remote.com', 'remote.com', 'hr', ['REMOTE.COM', 'REMOTE TECHNOLOGY']),
  m('Lattice', 'lattice.com', 'hr', ['LATTICE']),
  m('15Five', '15five.com', 'hr', ['15FIVE']),
  m('Culture Amp', 'cultureamp.com', 'hr', ['CULTURE AMP', 'CULTUREAMP']),
  m('Lever', 'lever.co', 'hr', ['LEVER.CO', 'LEVER HIRE']),
  m('Greenhouse', 'greenhouse.io', 'hr', ['GREENHOUSE SOFTWARE', 'GREENHOUSE.IO']),
  m('Workable', 'workable.com', 'hr', ['WORKABLE']),
  m('Indeed', 'indeed.com', 'hr', ['INDEED'], { forgotten: true }),
  m('ZipRecruiter', 'ziprecruiter.com', 'hr', ['ZIPRECRUITER'], { forgotten: true }),

  // ── Security / identity ──
  m('1Password', '1password.com', 'security', ['1PASSWORD', 'AGILEBITS']),
  m('LastPass', 'lastpass.com', 'security', ['LASTPASS'], { forgotten: true }),
  m('Dashlane', 'dashlane.com', 'security', ['DASHLANE'], { forgotten: true }),
  m('Bitwarden', 'bitwarden.com', 'security', ['BITWARDEN']),
  m('Okta', 'okta.com', 'security', ['OKTA']),
  m('Duo Security', 'duo.com', 'security', ['DUO SECURITY', 'DUO.COM']),
  m('NordVPN', 'nordvpn.com', 'security', ['NORDVPN', 'NORD VPN', 'NORDSEC'], { forgotten: true }),
  m('ExpressVPN', 'expressvpn.com', 'security', ['EXPRESSVPN', 'EXPRESS VPN'], { forgotten: true }),
  m('Norton', 'norton.com', 'security', ['NORTON', 'NORTONLIFELOCK'], { forgotten: true }),
  m('McAfee', 'mcafee.com', 'security', ['MCAFEE'], { forgotten: true }),
  m('Malwarebytes', 'malwarebytes.com', 'security', ['MALWAREBYTES'], { forgotten: true }),
  m('CrowdStrike', 'crowdstrike.com', 'security', ['CROWDSTRIKE']),
  m('KnowBe4', 'knowbe4.com', 'security', ['KNOWBE4']),
  m('Vanta', 'vanta.com', 'security', ['VANTA']),
  m('Drata', 'drata.com', 'security', ['DRATA']),
  m('Snyk', 'snyk.io', 'security', ['SNYK']),

  // ── Analytics / data ──
  m('Mixpanel', 'mixpanel.com', 'analytics', ['MIXPANEL']),
  m('Amplitude', 'amplitude.com', 'analytics', ['AMPLITUDE']),
  m('Segment', 'segment.com', 'analytics', ['SEGMENT.IO', 'SEGMENT.COM', 'TWILIO SEGMENT']),
  m('Heap', 'heap.io', 'analytics', ['HEAP INC', 'HEAP.IO']),
  m('Hotjar', 'hotjar.com', 'analytics', ['HOTJAR'], { forgotten: true }),
  m('FullStory', 'fullstory.com', 'analytics', ['FULLSTORY']),
  m('Tableau', 'tableau.com', 'analytics', ['TABLEAU']),
  m('Looker', 'looker.com', 'analytics', ['LOOKER']),
  m('Metabase', 'metabase.com', 'analytics', ['METABASE']),
  m('Mode', 'mode.com', 'analytics', ['MODE ANALYTICS']),
  m('Fathom', 'usefathom.com', 'analytics', ['USEFATHOM', 'FATHOM ANALYTICS']),
  m('Plausible', 'plausible.io', 'analytics', ['PLAUSIBLE']),
  m('PostHog', 'posthog.com', 'analytics', ['POSTHOG']),

  // ── Marketing / SEO / social ──
  m('Semrush', 'semrush.com', 'marketing', ['SEMRUSH'], { forgotten: true }),
  m('Ahrefs', 'ahrefs.com', 'marketing', ['AHREFS'], { forgotten: true }),
  m('Moz', 'moz.com', 'marketing', ['MOZ.COM', 'MOZ PRO'], { forgotten: true }),
  m('Screaming Frog', 'screamingfrog.co.uk', 'marketing', ['SCREAMING FROG', 'SCREAMINGFROG']),
  m('BuzzSumo', 'buzzsumo.com', 'marketing', ['BUZZSUMO'], { forgotten: true }),
  m('Hootsuite', 'hootsuite.com', 'social-media', ['HOOTSUITE'], { forgotten: true }),
  m('Buffer', 'buffer.com', 'social-media', ['BUFFER'], { forgotten: true }),
  m('Sprout Social', 'sproutsocial.com', 'social-media', ['SPROUT SOCIAL', 'SPROUTSOCIAL']),
  m('Later', 'later.com', 'social-media', ['LATER.COM', 'LATER SOCIAL'], { forgotten: true }),
  m('Unbounce', 'unbounce.com', 'marketing', ['UNBOUNCE'], { forgotten: true }),
  m('Leadpages', 'leadpages.com', 'marketing', ['LEADPAGES'], { forgotten: true }),
  m('Typeform', 'typeform.com', 'marketing', ['TYPEFORM'], { forgotten: true }),
  m('SurveyMonkey', 'surveymonkey.com', 'marketing', ['SURVEYMONKEY', 'MOMENTIVE'], { forgotten: true }),
  m('Meta Ads', 'facebook.com', 'marketing', ['FACEBK ADS', 'META ADS', 'FACEBOOK ADS']),
  m('X Premium', 'x.com', 'social-media', ['X PREMIUM', 'TWITTER PAID', 'X CORP'], { forgotten: true }),
  m('Canny', 'canny.io', 'marketing', ['CANNY.IO']),
  m('Mailmodo', 'mailmodo.com', 'email-marketing', ['MAILMODO']),

  // ── Support / success ──
  m('Zendesk', 'zendesk.com', 'support', ['ZENDESK']),
  m('Intercom', 'intercom.com', 'support', ['INTERCOM']),
  m('Freshdesk', 'freshdesk.com', 'support', ['FRESHDESK']),
  m('Help Scout', 'helpscout.com', 'support', ['HELP SCOUT', 'HELPSCOUT']),
  m('Gorgias', 'gorgias.com', 'support', ['GORGIAS']),
  m('Crisp', 'crisp.chat', 'support', ['CRISP.CHAT', 'CRISP IM']),
  m('Tidio', 'tidio.com', 'support', ['TIDIO']),

  // ── E-sign / legal / docs ──
  m('DocuSign', 'docusign.com', 'legal', ['DOCUSIGN']),
  m('PandaDoc', 'pandadoc.com', 'legal', ['PANDADOC']),
  m('Dropbox Sign', 'hellosign.com', 'legal', ['HELLOSIGN', 'DROPBOX SIGN']),
  m('LegalZoom', 'legalzoom.com', 'legal', ['LEGALZOOM'], { forgotten: true }),
  m('Rocket Lawyer', 'rocketlawyer.com', 'legal', ['ROCKET LAWYER', 'ROCKETLAWYER'], { forgotten: true }),
  m('Ironclad', 'ironcladapp.com', 'legal', ['IRONCLAD']),
  m('Clerky', 'clerky.com', 'legal', ['CLERKY']),
  m('Carta', 'carta.com', 'legal', ['CARTA', 'ESHARES']),

  // ── Shipping / logistics ──
  m('ShipStation', 'shipstation.com', 'shipping', ['SHIPSTATION']),
  m('Shippo', 'goshippo.com', 'shipping', ['SHIPPO']),
  m('Stamps.com', 'stamps.com', 'shipping', ['STAMPS.COM'], { forgotten: true }),
  m('Pirate Ship', 'pirateship.com', 'shipping', ['PIRATE SHIP', 'PIRATESHIP']),
  m('EasyPost', 'easypost.com', 'shipping', ['EASYPOST']),

  // ── Learning / media ──
  m('Coursera', 'coursera.org', 'education', ['COURSERA'], { forgotten: true }),
  m('Udemy', 'udemy.com', 'education', ['UDEMY'], { forgotten: true }),
  m('Skillshare', 'skillshare.com', 'education', ['SKILLSHARE'], { forgotten: true }),
  m('MasterClass', 'masterclass.com', 'education', ['MASTERCLASS'], { forgotten: true }),
  m('Pluralsight', 'pluralsight.com', 'education', ['PLURALSIGHT'], { forgotten: true }),
  m("O'Reilly", 'oreilly.com', 'education', ['OREILLY', "O'REILLY"], { forgotten: true }),
  m('LinkedIn Learning', 'linkedin.com', 'education', ['LINKEDIN LEARNING', 'LYNDA.COM'], { forgotten: true }),
  m('Netflix', 'netflix.com', 'media', ['NETFLIX'], { forgotten: true }),
  m('Spotify', 'spotify.com', 'media', ['SPOTIFY'], { forgotten: true }),
  m('Hulu', 'hulu.com', 'media', ['HULU'], { forgotten: true }),
  m('Disney+', 'disneyplus.com', 'media', ['DISNEY PLUS', 'DISNEYPLUS'], { forgotten: true }),
  m('The New York Times', 'nytimes.com', 'media', ['NYTIMES', 'NYT DIGITAL', 'NEW YORK TIMES'], { forgotten: true }),
  m('The Wall Street Journal', 'wsj.com', 'media', ['WSJ', 'WALL STREET JOURNAL', 'DOWJONES'], { forgotten: true }),
  m('The Economist', 'economist.com', 'media', ['ECONOMIST'], { forgotten: true }),
  m('Medium', 'medium.com', 'media', ['MEDIUM.COM', 'MEDIUM MONTHLY', 'MEDIUM ANNUAL'], { forgotten: true }),
  m('Headspace', 'headspace.com', 'media', ['HEADSPACE'], { forgotten: true }),
  m('Calm', 'calm.com', 'media', ['CALM.COM'], { forgotten: true }),

  // ── Comms infra / misc business ──
  m('Comcast Business', 'business.comcast.com', 'telecom', ['COMCAST BUSINESS', 'COMCAST CABLE']),
  m('Verizon', 'verizon.com', 'telecom', ['VERIZON', 'VZWRLSS']),
  m('AT&T', 'att.com', 'telecom', ['AT&T', 'ATT*BILL', 'ATT PAYMENT']),
  m('T-Mobile', 't-mobile.com', 'telecom', ['T-MOBILE', 'TMOBILE']),
  m('Spectrum', 'spectrum.com', 'telecom', ['SPECTRUM', 'CHARTER COMM']),
  m('WeWork', 'wework.com', 'other', ['WEWORK']),
  m('Regus', 'regus.com', 'other', ['REGUS']),
  m('Canva Print', 'canva.com', 'design', ['CANVA PRINT']),
  m('Notarize', 'notarize.com', 'legal', ['NOTARIZE']),
  m('Doodle', 'doodle.com', 'productivity', ['DOODLE'], { forgotten: true }),
  m('Dropbox DocSend', 'docsend.com', 'productivity', ['DOCSEND']),
  m('Loom AI', 'loom.com', 'video-conferencing', ['LOOM AI']),
] as const

export interface DictionaryMatch {
  entry: MerchantEntry
}

/** Match an UPPERCASED raw descriptor against the dictionary, first hit wins. */
export function matchMerchant(upperRaw: string): MerchantEntry | null {
  for (const entry of MERCHANT_DICTIONARY) {
    for (const pattern of entry.patterns) {
      if (typeof pattern === 'string') {
        if (upperRaw.includes(pattern)) return entry
      } else if (pattern.test(upperRaw)) {
        return entry
      }
    }
  }
  return null
}

/** Build a logo URL from a dictionary domain (Clearbit-style, swappable for logo.dev). */
export function logoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`
}
