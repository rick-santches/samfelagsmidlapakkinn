import { orgDb } from '@/lib/db'
import { plaidConfigured } from '@/lib/plaid'
import { planSpec } from '@/lib/plans'
import { requireOrg } from '@/lib/session'
import { CsvUploader } from './csv-uploader'
import { PlaidConnect } from './plaid-connect'
import { SyncButton } from './sync-button'

export default async function SourcesPage() {
  const { org } = await requireOrg()
  const sources = await orgDb(org.id).connectedSource.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { transactions: true } } },
  })
  const plaidAllowed = planSpec(org.plan).plaidAllowed
  const plaidReady = plaidConfigured()

  return (
    <div>
      <h1 className="text-2xl font-bold">Sources</h1>
      <p className="mt-2 text-sm text-ink-300">
        Feed Zombly your statements — upload a CSV or connect the bank
        directly. Same detection pipeline either way.
      </p>

      <div className="mt-8">
        <CsvUploader />
      </div>

      <div className="mt-4 rounded-xl border border-ink-800 bg-ink-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Connect a bank</p>
            <p className="mt-1 text-sm text-ink-400">
              Plaid pulls up to 18 months of history and keeps syncing new
              charges automatically.
            </p>
          </div>
          {!plaidAllowed ? (
            <a
              href="/dashboard/settings#billing"
              className="rounded-lg border border-ink-700 px-5 py-2.5 text-sm font-semibold text-ink-200 transition hover:border-ink-500"
            >
              Team plan feature — upgrade
            </a>
          ) : !plaidReady ? (
            <p className="text-sm text-ink-500">
              Set PLAID_CLIENT_ID / PLAID_SECRET to enable
            </p>
          ) : (
            <PlaidConnect />
          )}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-ink-800 bg-ink-900/30 p-6">
        <p className="font-semibold text-ink-300">
          Email receipt forwarding{' '}
          <span className="ml-1 rounded-full bg-ink-800 px-2 py-0.5 text-xs font-medium text-ink-400">
            coming soon
          </span>
        </p>
        <p className="mt-1 text-sm text-ink-500">
          Forward vendor receipts to{' '}
          <code className="rounded bg-ink-800 px-1.5 py-0.5 text-xs text-ink-300">
            receipts+{org.id.slice(-8)}@zombly.com
          </code>{' '}
          and they&apos;ll flow into the same audit.
        </p>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Connected sources</h2>
      {sources.length === 0 ? (
        <p className="mt-3 text-sm text-ink-400">
          Nothing yet. The zombies remain unhunted.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-ink-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Transactions</th>
                <th className="px-4 py-3 font-medium">Last synced</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id} className="border-t border-ink-800">
                  <td className="px-4 py-3 font-medium">{source.label}</td>
                  <td className="px-4 py-3 text-ink-300">{source.type}</td>
                  <td className="num px-4 py-3 text-ink-300">
                    {source._count.transactions}
                  </td>
                  <td className="px-4 py-3 text-ink-300">
                    {source.lastSyncedAt
                      ? source.lastSyncedAt.toISOString().slice(0, 10)
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ink-800 px-2 py-0.5 text-xs text-ink-200">
                      {source.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {source.type === 'PLAID' && <SyncButton sourceId={source.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
