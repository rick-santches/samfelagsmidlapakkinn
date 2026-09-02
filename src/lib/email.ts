import { Resend } from 'resend'

/**
 * Email sending via Resend. Without an API key (local dev), emails are
 * printed to the server console instead — same as auth magic links.
 */
export interface EmailMessage {
  to: string[]
  subject: string
  html: string
  text: string
}

let client: Resend | null = null

function resend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!client) client = new Resend(key)
  return client
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (message.to.length === 0) return
  const from = process.env.EMAIL_FROM ?? 'Zombly <alerts@zombly.com>'
  const api = resend()
  if (!api) {
    console.log(
      `[zombly] email (dev, not sent) → ${message.to.join(', ')}\n  subject: ${message.subject}\n${message.text
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n')}`,
    )
    return
  }
  await api.emails.send({
    from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  })
}
