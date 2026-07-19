import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms for using Zombly.',
  alternates: { canonical: '/terms' },
}

const SECTIONS: Array<{ h: string; p: string[] }> = [
  {
    h: '1. What Zombly is',
    p: [
      'Zombly is a subscription and spend auditing tool. You upload or connect financial statement data, and Zombly detects recurring charges, flags likely waste, and estimates potential savings. Estimates are exactly that — estimates based on the transaction data you provide. Zombly does not cancel subscriptions on your behalf and is not a financial adviser.',
    ],
  },
  {
    h: '2. Your account',
    p: [
      'You are responsible for the accuracy of the data you upload, for keeping your sign-in credentials safe, and for the people you invite to your organization. You must have the right to use any financial data you bring into Zombly.',
    ],
  },
  {
    h: '3. Plans and billing',
    p: [
      'Paid plans (Solo, Team) bill through PayPal on a monthly or annual cycle and renew automatically until canceled. You can cancel anytime in Settings; cancellation stops future charges and returns your organization to the free plan. Fees already paid are non-refundable except where required by law.',
    ],
  },
  {
    h: '4. Your data',
    p: [
      'Your transaction data belongs to you. We use it solely to provide the service — detection, flags, reports, and the alerts you enable. We do not sell it or share it with third parties for their own purposes. See the Privacy Policy for details.',
    ],
  },
  {
    h: '5. Acceptable use',
    p: [
      'Do not upload data you have no right to use, probe or disrupt the service, or attempt to access other organizations’ data. We may suspend accounts that do.',
    ],
  },
  {
    h: '6. Disclaimers',
    p: [
      'Zombly is provided “as is”. Detection is automated and can miss charges or flag things you actually use — always verify before canceling a vendor. To the maximum extent permitted by law, our liability is limited to the amount you paid us in the twelve months before a claim.',
    ],
  },
  {
    h: '7. Changes',
    p: [
      'We may update these terms as the product evolves; material changes will be announced in the app or by email. Continuing to use Zombly after a change means you accept the updated terms.',
    ],
  },
]

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-20 pt-14">
      <Link href="/" className="text-sm text-ink-400 hover:text-ink-200">← Zombly</Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink-400">Plain-English terms. Last updated July 2026.</p>
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
