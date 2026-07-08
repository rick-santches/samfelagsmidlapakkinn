'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { formatMoney } from '@/lib/money'

export interface SparkPoint {
  label: string
  amountCents: number
}

export function ChargeSparkline({ data }: { data: SparkPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={64}>
      <LineChart data={data} margin={{ top: 6, right: 4, bottom: 4, left: 4 }}>
        <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const point = payload[0]?.payload as SparkPoint | undefined
            if (!point) return null
            return (
              <div className="rounded-lg border border-ink-700 bg-ink-950 px-2 py-1 text-xs shadow-lg">
                <span className="text-ink-400">{point.label}</span>{' '}
                <span className="num font-semibold text-ink-100">
                  {formatMoney(point.amountCents)}
                </span>
              </div>
            )
          }}
        />
        <Line
          type="monotone"
          dataKey="amountCents"
          stroke="#A3E635"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: '#A3E635', stroke: '#0F141C', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
