'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The hero "hunt": a sample statement that scans row by row, tags the waste
 * with flame badges, and tallies recoverable savings as it goes. It's the
 * whole product in one glance. Respects prefers-reduced-motion by showing the
 * finished scan immediately.
 */

type Row = {
  merchant: string
  note: string
  amount: string
  flag?: { label: string; savingsCents: number }
}

const ROWS: Row[] = [
  { merchant: 'AWS', note: 'infrastructure', amount: '$312.40' },
  { merchant: 'Slack', note: 'team chat', amount: '$87.00' },
  { merchant: 'Ghost CRM', note: 'no logins in 8 months', amount: '$89.00', flag: { label: 'Zombie', savingsCents: 106800 } },
  { merchant: 'Zoom', note: 'you also pay for Google Meet', amount: '$149.90', flag: { label: 'Overlap', savingsCents: 19200 } },
  { merchant: 'Adobe CC', note: 'quietly went $54.99 → $59.99', amount: '$59.99', flag: { label: 'Price hike', savingsCents: 6000 } },
  { merchant: 'QuickBooks', note: 'accounting', amount: '$90.00' },
  { merchant: 'Dropbox', note: 'billed twice — two accounts', amount: '$23.98', flag: { label: 'Duplicate', savingsCents: 14388 } },
]

const TOTAL = ROWS.reduce((s, r) => s + (r.flag?.savingsCents ?? 0), 0)
const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    Math.round(cents / 100),
  )

export function ScannerDemo() {
  const [revealed, setRevealed] = useState(0)
  const [target, setTarget] = useState(0)
  const [display, setDisplay] = useState(0)
  const [done, setDone] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const raf = useRef<number>()

  // Reveal rows on a cadence; add each flag's savings to the target as it lands.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setRevealed(ROWS.length)
      setTarget(TOTAL)
      setDisplay(TOTAL)
      setDone(true)
      return
    }
    let acc = 0
    ROWS.forEach((row, i) => {
      timers.current.push(
        setTimeout(() => {
          setRevealed(i + 1)
          if (row.flag) {
            acc += row.flag.savingsCents
            setTarget(acc)
          }
          if (i === ROWS.length - 1) {
            timers.current.push(setTimeout(() => setDone(true), 450))
          }
        }, 500 + i * 680),
      )
    })
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [])

  // Ease the displayed total toward the running target (accumulating, never resetting).
  useEffect(() => {
    const from = display
    const start = performance.now()
    const dur = 650
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  const flagsFound = ROWS.slice(0, revealed).filter((r) => r.flag).length

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-[0_0_60px_-24px_rgba(163,230,53,0.4)]">
      {/* Terminal-style bar */}
      <div className="flex items-center justify-between border-b border-ink-800 bg-ink-850 px-4 py-2.5">
        <span className="num text-xs tracking-wide text-ink-500">business-statement.csv</span>
        <span
          className={`flex items-center gap-1.5 text-xs font-medium ${
            done ? 'text-savings' : 'text-ink-400'
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              done ? 'bg-savings' : 'animate-pulse bg-flame'
            }`}
          />
          {done ? `${flagsFound} zombies found` : 'Scanning…'}
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-ink-800/70">
        {ROWS.map((row, i) => {
          const shown = i < revealed
          const flagged = Boolean(row.flag)
          return (
            <div
              key={row.merchant}
              className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-500 ${
                shown ? 'opacity-100' : 'translate-y-1 opacity-0'
              } ${flagged && shown ? 'bg-flame/[0.06]' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-100">{row.merchant}</p>
                <p className="truncate text-xs text-ink-500">{row.note}</p>
              </div>
              {flagged && shown && (
                <span className="shrink-0 rounded-full bg-flame/15 px-2 py-0.5 text-[11px] font-semibold text-flame">
                  {row.flag!.label}
                </span>
              )}
              <span className="num w-20 shrink-0 text-right text-sm text-ink-300">
                {row.amount}
                <span className="text-ink-600">/mo</span>
              </span>
            </div>
          )
        })}
      </div>

      {/* Tally footer */}
      <div className="flex items-center justify-between border-t border-ink-800 bg-ink-850 px-4 py-3.5">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-ink-500">Recoverable / year</p>
          <p className={`num text-2xl font-bold ${target > 0 ? 'text-savings' : 'text-ink-600'}`}>
            {money(display)}
          </p>
        </div>
        {done ? (
          <span className="rounded-lg bg-savings/15 px-3 py-1.5 text-xs font-semibold text-savings">
            Kill List ready →
          </span>
        ) : (
          <span className="num text-xs text-ink-500">reading charges…</span>
        )}
      </div>
    </div>
  )
}
