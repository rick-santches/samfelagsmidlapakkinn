'use client'

export function ExportButtons() {
  return (
    <div className="flex gap-2 print:hidden">
      <a
        href="/api/killlist/export"
        className="rounded-lg border border-ink-700 px-4 py-2 text-sm font-semibold text-ink-200 transition hover:border-ink-500"
      >
        Export CSV
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-savings px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-savings-glow"
      >
        Export PDF
      </button>
    </div>
  )
}
