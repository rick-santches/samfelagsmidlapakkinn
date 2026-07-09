'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { categoryLabel } from '@/lib/category-label'

const STATUSES = ['ALL', 'ACTIVE', 'FLAGGED', 'CANCELED', 'IGNORED'] as const
const SORTS: Array<{ value: string; label: string }> = [
  { value: 'amount', label: 'Amount' },
  { value: 'name', label: 'Name' },
  { value: 'lastSeen', label: 'Last charge' },
  { value: 'confidence', label: 'Confidence' },
]

export function SubscriptionFilters({ categories }: { categories: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  // Update one param, reset to a clean URL when a filter goes back to default.
  const setParam = useCallback(
    (key: string, value: string, defaultValue: string) => {
      const next = new URLSearchParams(params.toString())
      if (value === defaultValue) next.delete(key)
      else next.set(key, value)
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [params, pathname, router],
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        defaultValue={params.get('q') ?? ''}
        onChange={(e) => setParam('q', e.target.value.trim(), '')}
        placeholder="Search merchant…"
        className="w-44 rounded-lg border border-ink-700 bg-ink-950 px-3 py-1.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-savings focus:outline-none"
      />
      <Select
        value={params.get('status') ?? 'ALL'}
        onChange={(v) => setParam('status', v, 'ALL')}
        options={STATUSES.map((s) => ({
          value: s,
          label: s === 'ALL' ? 'All statuses' : s.charAt(0) + s.slice(1).toLowerCase(),
        }))}
      />
      <Select
        value={params.get('category') ?? 'ALL'}
        onChange={(v) => setParam('category', v, 'ALL')}
        options={[
          { value: 'ALL', label: 'All categories' },
          ...categories.map((c) => ({ value: c, label: categoryLabel(c) })),
        ]}
      />
      <Select
        value={params.get('sort') ?? 'amount'}
        onChange={(v) => setParam('sort', v, 'amount')}
        options={SORTS}
      />
    </div>
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-ink-700 bg-ink-950 px-3 py-1.5 text-sm text-ink-200 focus:border-savings focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
