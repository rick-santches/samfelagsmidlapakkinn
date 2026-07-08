import type { Plan } from '@prisma/client'
import { prisma } from '@/lib/db'
import { formatMoneyWhole } from '@/lib/money'
import { PLANS } from '@/lib/plans'
import { requireOrg } from '@/lib/session'
import { stripeConfigured } from '@/lib/stripe'
import { updateAlertPrefs } from './actions'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { billing?: string }
}) {
  const { org, role, user } = await requireOrg()
  const billingEnabled = stripeConfigured()
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, orgId: org.id },
  })

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {searchParams.billing === 'success' && (
        <div className="mt-4 rounded-lg border border-savings/40 bg-savings/10 px-4 py-3 text-sm text-savings">
          Payment received — your plan updates as soon as Stripe confirms it
          (usually seconds). Happy hunting.
        </div>
      )}
      {searchParams.billing === 'canceled' && (
        <div className="mt-4 rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-ink-300">
          Checkout canceled. The zombies remain… for now.
        </div>
      )}

      <section className="mt-6 rounded-xl border border-ink-800 bg-ink-900 p-6">
        <h2 className="text-sm font-semibold text-ink-200">Organization</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ink-400">Name</dt>
            <dd className="mt-0.5 font-medium">{org.name}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Your role</dt>
            <dd className="mt-0.5 font-medium">{role}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Signed in as</dt>
            <dd className="mt-0.5 truncate font-medium">{user.email}</dd>
          </div>
        </dl>
      </section>

      <section id="billing" className="mt-6 scroll-mt-8">
        <h2 className="text-lg font-semibold">Billing</h2>
        <p className="mt-1 text-sm text-ink-400">
          Current plan:{' '}
          <span className="font-semibold text-ink-100">{PLANS[org.plan].name}</span>
          {org.plan !== 'FREE' && billingEnabled && org.stripeCustomerId && (
            <>
              {' · '}
              <a href="/api/billing/portal" className="text-savings hover:underline">
                Manage billing ↗
              </a>
            </>
          )}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(Object.keys(PLANS) as Plan[]).map((plan) => {
            const spec = PLANS[plan]
            const isCurrent = org.plan === plan
            return (
              <div
                key={plan}
                className={`flex flex-col rounded-xl border p-5 ${
                  isCurrent ? 'border-savings/50 bg-ink-900' : 'border-ink-800 bg-ink-900'
                }`}
              >
                <p className="font-semibold">{spec.name}</p>
                <p className="num mt-2 text-2xl font-bold">
                  {spec.monthlyCents === 0 ? 'Free' : `${formatMoneyWhole(spec.monthlyCents)}`}
                  {spec.monthlyCents > 0 && (
                    <span className="text-sm font-normal text-ink-400">/mo</span>
                  )}
                </p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-400">
                  {spec.blurb}
                </p>
                {isCurrent ? (
                  <p className="mt-4 rounded-lg border border-savings/40 py-2 text-center text-sm font-semibold text-savings">
                    Current plan
                  </p>
                ) : plan === 'FREE' ? (
                  <p className="mt-4 py-2 text-center text-xs text-ink-500">
                    Downgrade via Manage billing
                  </p>
                ) : billingEnabled ? (
                  <div className="mt-4 space-y-2">
                    <a
                      href={`/api/billing/checkout?plan=${plan}&interval=month`}
                      className="block rounded-lg bg-savings py-2 text-center text-sm font-semibold text-ink-950 transition hover:bg-savings-glow"
                    >
                      Go {spec.name} monthly
                    </a>
                    <a
                      href={`/api/billing/checkout?plan=${plan}&interval=year`}
                      className="block rounded-lg border border-ink-700 py-2 text-center text-xs font-medium text-ink-200 transition hover:border-ink-500"
                    >
                      Annual {formatMoneyWhole(spec.annualCents)} — 2 months free
                    </a>
                  </div>
                ) : (
                  <p className="mt-4 py-2 text-center text-xs text-ink-500">
                    Set STRIPE_SECRET_KEY to enable checkout
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-ink-800 bg-ink-900 p-6">
        <h2 className="text-sm font-semibold text-ink-200">Email alerts</h2>
        <p className="mt-1 text-xs text-ink-400">
          Paid plans only — the zombies don&apos;t announce themselves.
        </p>
        <form action={updateAlertPrefs} className="mt-4 space-y-3 text-sm">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="instant"
              defaultChecked={membership?.emailInstantAlerts ?? true}
              className="h-4 w-4 accent-savings"
            />
            <span>
              Instant alerts
              <span className="block text-xs text-ink-400">
                Price hikes and trial conversions, the moment they&apos;re detected
              </span>
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="digest"
              defaultChecked={membership?.emailWeeklyDigest ?? true}
              className="h-4 w-4 accent-savings"
            />
            <span>
              Weekly digest
              <span className="block text-xs text-ink-400">
                New subscriptions, upcoming renewals, fresh flags — every Monday
              </span>
            </span>
          </label>
          <button
            type="submit"
            className="rounded-lg border border-ink-700 px-4 py-2 text-sm font-semibold text-ink-200 transition hover:border-ink-500"
          >
            Save preferences
          </button>
        </form>
      </section>

      <p className="mt-8 text-sm text-ink-500">
        Team member invites land with Plaid in a later phase.
      </p>
    </div>
  )
}
