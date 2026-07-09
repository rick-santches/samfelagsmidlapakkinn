import { NextResponse } from 'next/server'
import { siteConfig } from '@/lib/content'

/**
 * Contact/booking endpoint, stubbed for Resend.
 *
 * To enable real email delivery:
 *   1. Create an API key at https://resend.com
 *   2. Set RESEND_API_KEY in your environment (Vercel → Settings → Env Vars)
 *   3. Optionally set CONTACT_TO_EMAIL (defaults to siteConfig.contact.email)
 *
 * Without a key the endpoint still succeeds (logs the submission) so the
 * demo works end-to-end out of the box.
 */

interface Submission {
  kind?: 'contact' | 'booking'
  name?: string
  email?: string
  message?: string
  date?: string
  time?: string
  guests?: string
  phone?: string
}

function buildEmail(data: Submission): { subject: string; text: string } {
  if (data.kind === 'booking') {
    return {
      subject: `Borðapöntun — ${data.name ?? 'Óþekkt nafn'}`,
      text: [
        `Ný borðapöntun af vefsíðunni:`,
        ``,
        `Nafn: ${data.name ?? ''}`,
        `Sími: ${data.phone ?? ''}`,
        `Dagsetning: ${data.date ?? ''}`,
        `Tími: ${data.time ?? ''}`,
        `Fjöldi gesta: ${data.guests ?? ''}`,
      ].join('\n'),
    }
  }
  return {
    subject: `Fyrirspurn af vefsíðu — ${data.name ?? 'Óþekkt nafn'}`,
    text: [
      `Ný skilaboð af vefsíðunni:`,
      ``,
      `Nafn: ${data.name ?? ''}`,
      `Netfang: ${data.email ?? ''}`,
      ``,
      `${data.message ?? ''}`,
    ].join('\n'),
  }
}

export async function POST(request: Request) {
  let data: Submission
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ógild beiðni' }, { status: 400 })
  }

  // Minimal validation per form type
  if (data.kind === 'booking') {
    if (!data.name || !data.phone || !data.date || !data.time) {
      return NextResponse.json({ error: 'Vantar upplýsingar' }, { status: 400 })
    }
  } else if (!data.name || !data.email || !data.message) {
    return NextResponse.json({ error: 'Vantar upplýsingar' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const { subject, text } = buildEmail(data)

  if (!apiKey) {
    // Graceful degradation: no email service configured — accept and log.
    console.log(`[contact] RESEND_API_KEY not set — submission logged only:\n${subject}\n${text}`)
    return NextResponse.json({ ok: true, delivered: false })
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${siteConfig.name} <onboarding@resend.dev>`,
        to: process.env.CONTACT_TO_EMAIL ?? siteConfig.contact.email,
        reply_to: data.email,
        subject,
        text,
      }),
    })

    if (!res.ok) {
      console.error('[contact] Resend error:', await res.text())
      return NextResponse.json({ error: 'Sending mistókst' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, delivered: true })
  } catch (err) {
    console.error('[contact] Unexpected error:', err)
    return NextResponse.json({ error: 'Sending mistókst' }, { status: 502 })
  }
}
