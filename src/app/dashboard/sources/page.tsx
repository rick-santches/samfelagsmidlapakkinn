import { orgDb } from '@/lib/db'
import { requireOrg } from '@/lib/session'
import { CsvUploader } from './csv-uploader'

export default async function SourcesPage() {
  const { org } = await requireOrg()
  const sources = await orgDb(org.id).connectedSource.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { transactions: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Sources</h1>
      <p className="mt-2 text-sm text-ink-300">
        Feed Zombly your statements. CSV today; Plaid bank connections land
        in Phase 9 — same pipeline either way.
      </p>

      <div className="mt-8">
        <CsvUploader />
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
