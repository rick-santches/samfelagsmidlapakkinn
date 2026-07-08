'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthlySpendPoint } from '@/lib/dashboard-data'
import { formatMoney, formatMoneyWhole } from '@/lib/money'

const LINE = '#A3E635'
const GRID = '#242E3F'
const AXIS_TEXT = '#6B7C99'

export function SpendOverTimeChart({ data }: { data: MonthlySpendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE} stopOpacity={0.25} />
            <stop offset="100%" stopColor={LINE} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: AXIS_TEXT, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: AXIS_TEXT, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(cents: number) => formatMoneyWhole(cents)}
        />
        <Tooltip
          cursor={{ stroke: AXIS_TEXT, strokeWidth: 1, strokeDasharray: '3 3' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const value = payload[0]?.value
            return (
              <div className="rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-xs shadow-lg">
                <p className="text-ink-400">{String(label)}</p>
                <p className="num mt-0.5 font-semibold text-ink-100">
                  {typeof value === 'number' ? formatMoney(value) : '—'}
                </p>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="spendCents"
          stroke={LINE}
          strokeWidth={2}
          fill="url(#spendFill)"
          dot={false}
          activeDot={{ r: 4, fill: LINE, stroke: '#0F141C', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
