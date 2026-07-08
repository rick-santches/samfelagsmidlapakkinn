'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { categoryLabel } from '@/lib/category-label'
import type { CategorySlice } from '@/lib/dashboard-data'
import { formatMoney } from '@/lib/money'

/**
 * Categorical palette validated for the dark surface (#0F141C) with
 * scripts/validate_palette.js — lightness band, chroma, CVD separation,
 * and contrast all pass. Hues are assigned in this fixed order; extra
 * categories fold into "Other".
 */
const PALETTE: readonly string[] = ['#65A30D', '#0284C7', '#EC4899', '#D97706', '#8B5CF6', '#0D9488']
const OTHER_COLOR = '#4A5A75'
const SURFACE = '#0F141C'
const MAX_SLICES = 5

interface DonutDatum {
  name: string
  value: number
  color: string
}

function toDonutData(categories: CategorySlice[]): DonutDatum[] {
  const named = categories.filter((c) => c.monthlyCents > 0)
  const top = named.slice(0, MAX_SLICES).map((c, i) => ({
    name: categoryLabel(c.category),
    value: c.monthlyCents,
    color: PALETTE[i] ?? OTHER_COLOR,
  }))
  const rest = named.slice(MAX_SLICES)
  if (rest.length > 0) {
    top.push({
      name: 'Other',
      value: rest.reduce((sum, c) => sum + c.monthlyCents, 0),
      color: OTHER_COLOR,
    })
  }
  return top
}

export function CategoryDonut({ categories }: { categories: CategorySlice[] }) {
  const data = toDonutData(categories)
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null

  return (
    <div className="flex items-center gap-6">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const datum = payload[0]?.payload as DonutDatum | undefined
                if (!datum) return null
                return (
                  <div className="rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-xs shadow-lg">
                    <p className="text-ink-400">{datum.name}</p>
                    <p className="num mt-0.5 font-semibold text-ink-100">
                      {formatMoney(datum.value)}/mo ·{' '}
                      {Math.round((datum.value / total) * 100)}%
                    </p>
                  </div>
                )
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={1}
              stroke={SURFACE}
              strokeWidth={2}
            >
              {data.map((datum) => (
                <Cell key={datum.name} fill={datum.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
        {data.map((datum) => (
          <li key={datum.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: datum.color }}
            />
            <span className="truncate text-ink-200">{datum.name}</span>
            <span className="num ml-auto text-ink-400">
              {Math.round((datum.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
