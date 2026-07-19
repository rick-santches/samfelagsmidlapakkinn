import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Zombly handles your data.',
  alternates: { canonical: '/privacy' },
}

const SECTIONS: Array<{ h: string; p: string[] }> = [
  {
    h: 'What we collect',
    p: [
      'Account data: your email, name, and organization name. Financial data: the transaction rows you upload (date, amount, bank descriptor) or authorize via a bank connection. Usage data: standard server logs needed to run and secure the service.',
    ],
  },
  {
    h: 'How we use it',
    p: [
      'Only to provide Zombly: detecting recurring charges, generating flags and reports, sending the alerts you enable, and processing payments. We do not sell your data, rent it, or share it with third parties for advertising.',
    ],
  },
  {
    h: 'How it’s protected',
    p: [
      'Every database query is scoped to your organization at the data layer, so one customer can never read another’s records. Bank connection tokens are encrypted at rest (AES-256-GCM). Raw transaction descriptions are never written to application logs. Access to production systems is limited to what’s needed to operate the service.',
    ],
  },
  {
    h: 'Third parties we rely on',
    p: [
      'Hosting (Vercel), database (managed PostgreSQL), payments (PayPal — we never see your card number), email delivery (Resend), and optional bank connections (Plaid). Each receives only what it needs to do its job.',
    ],
  },
  {
    h: 'Your choices',
    p: [
      'You can use CSV uploads instead of bank connections, disable email alerts in Settings, and delete your data by deleting your organization — deletion cascades to every transaction, subscription, and flag we hold for it. Email us from your account address for a full export or erasure request.',
    ],
  },
  {
    h: 'Where and how long',
    p: [
      'Data is stored in the hosting region configured for your deployment and kept for as long as your account is active. Backups roll off on the database provider’s standard schedule after deletion.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-20 pt-14">
      <Link href="/" className="text-sm text-ink-400 hover:text-ink-200">← Zombly</Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-400">
        The short version: your financial data is yours, we guard it, and we
        don&apos;t sell it. Last updated July 2026.
      </p>
      <div className="mt-8 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="font-semibold">{s.h}</h2>
            {s.p.map((para) => (
              <p key={para.slice(0, 32)} className="mt-2 text-sm leading-relaxed text-ink-300">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  )
}
