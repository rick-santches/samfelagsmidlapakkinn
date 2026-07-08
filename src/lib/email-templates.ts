import { formatMoney } from './money'

/**
 * Email templates: plain, skimmable, one clear CTA. Voice: sharp friend,
 * not a bank. Inline styles only — email clients eat everything else.
 */

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function layout(bodyHtml: string, cta: { label: string; path: string }): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a2230;">
    <div style="max-width:540px;margin:0 auto;padding:32px 20px;">
      <p style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#65A30D;margin:0 0 24px;">Zombly</p>
      ${bodyHtml}
      <a href="${APP_URL()}${cta.path}" style="display:inline-block;margin-top:24px;background:#A3E635;color:#0A0E14;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px;text-decoration:none;">${cta.label}</a>
      <p style="margin-top:32px;font-size:12px;color:#8a94a6;">Zombly — kill your zombie subscriptions.<br/>Alert preferences live in Settings.</p>
    </div>
  </body>
</html>`
}

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

// ── Instant: PRICE_HIKE / TRIAL_CONVERTED ──

export function instantFlagEmail(input: {
  orgName: string
  flagType: 'PRICE_HIKE' | 'TRIAL_CONVERTED'
  merchantName: string
  explanation: string
  estimatedAnnualSavingsCents: number
}): RenderedEmail {
  const subject =
    input.flagType === 'PRICE_HIKE'
      ? `${input.merchantName} just raised its price on ${input.orgName}`
      : `A ${input.merchantName} trial started billing ${input.orgName}`

  const text = [
    input.explanation,
    '',
    `Worth up to ${formatMoney(input.estimatedAnnualSavingsCents)}/yr.`,
    '',
    `Decide in review: ${APP_URL()}/dashboard/review`,
  ].join('\n')

  const html = layout(
    `<h1 style="font-size:20px;margin:0 0 12px;">${subject}</h1>
     <p style="font-size:15px;line-height:1.6;margin:0;">${input.explanation}</p>
     <p style="font-size:15px;margin:16px 0 0;">That's up to <strong style="color:#4d7c0f;">${formatMoney(input.estimatedAnnualSavingsCents)}/yr</strong> if you act on it.</p>`,
    { label: 'Decide in review', path: '/dashboard/review' },
  )

  return { subject, html, text }
}

// ── Weekly digest ──

export interface DigestData {
  orgName: string
  newSubscriptions: Array<{ merchantName: string; amountLabel: string }>
  upcomingRenewals: Array<{ merchantName: string; amountCents: number; inDays: number }>
  newFlags: Array<{ merchantName: string; typeLabel: string; savingsCents: number }>
  totalFlaggedSavingsCents: number
}

export function weeklyDigestEmail(data: DigestData): RenderedEmail {
  const bits: string[] = []
  if (data.newFlags.length > 0) bits.push(`${data.newFlags.length} new flag${data.newFlags.length > 1 ? 's' : ''}`)
  if (data.newSubscriptions.length > 0) bits.push(`${data.newSubscriptions.length} new subscription${data.newSubscriptions.length > 1 ? 's' : ''}`)
  if (data.upcomingRenewals.length > 0) bits.push(`${data.upcomingRenewals.length} renewal${data.upcomingRenewals.length > 1 ? 's' : ''} coming up`)
  const subject = `Zombly weekly: ${bits.length > 0 ? bits.join(', ') : 'all quiet'} at ${data.orgName}`

  const textSections: string[] = []
  const htmlSections: string[] = []

  if (data.newFlags.length > 0) {
    textSections.push(
      'New flags:',
      ...data.newFlags.map((f) => `  - ${f.merchantName} (${f.typeLabel}) — ~${formatMoney(f.savingsCents)}/yr`),
      '',
    )
    htmlSections.push(
      `<h2 style="font-size:15px;margin:20px 0 8px;">New flags</h2>` +
        list(data.newFlags.map((f) => `<strong>${f.merchantName}</strong> (${f.typeLabel}) — ~${formatMoney(f.savingsCents)}/yr`)),
    )
  }
  if (data.upcomingRenewals.length > 0) {
    textSections.push(
      'Renewals in the next 14 days:',
      ...data.upcomingRenewals.map((r) => `  - ${r.merchantName}: ${formatMoney(r.amountCents)} in ${r.inDays} day${r.inDays === 1 ? '' : 's'}`),
      '',
    )
    htmlSections.push(
      `<h2 style="font-size:15px;margin:20px 0 8px;">Renewals in the next 14 days</h2>` +
        list(data.upcomingRenewals.map((r) => `<strong>${r.merchantName}</strong>: ${formatMoney(r.amountCents)} in ${r.inDays} day${r.inDays === 1 ? '' : 's'}`)),
    )
  }
  if (data.newSubscriptions.length > 0) {
    textSections.push(
      'New subscriptions detected:',
      ...data.newSubscriptions.map((s) => `  - ${s.merchantName} (${s.amountLabel})`),
      '',
    )
    htmlSections.push(
      `<h2 style="font-size:15px;margin:20px 0 8px;">New subscriptions detected</h2>` +
        list(data.newSubscriptions.map((s) => `<strong>${s.merchantName}</strong> (${s.amountLabel})`)),
    )
  }

  if (textSections.length === 0) {
    textSections.push('Nothing new this week. Your subscriptions behaved themselves.')
    htmlSections.push(`<p style="font-size:15px;line-height:1.6;">Nothing new this week. Your subscriptions behaved themselves.</p>`)
  }

  const text = [
    `Weekly audit for ${data.orgName}`,
    '',
    ...textSections,
    `Open flags are worth ~${formatMoney(data.totalFlaggedSavingsCents)}/yr in total.`,
    '',
    `Review: ${APP_URL()}/dashboard/review`,
  ].join('\n')

  const html = layout(
    `<h1 style="font-size:20px;margin:0 0 4px;">Weekly audit — ${data.orgName}</h1>
     <p style="font-size:14px;color:#5b6b82;margin:0;">Open flags are worth ~<strong style="color:#4d7c0f;">${formatMoney(data.totalFlaggedSavingsCents)}/yr</strong>.</p>
     ${htmlSections.join('')}`,
    { label: 'Open review', path: '/dashboard/review' },
  )

  return { subject, html, text }
}

function list(items: string[]): string {
  return `<ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.8;">${items
    .map((item) => `<li>${item}</li>`)
    .join('')}</ul>`
}
