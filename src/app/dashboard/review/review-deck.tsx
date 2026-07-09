'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { MerchantLogo } from '@/components/merchant-logo'
import { formatMoney } from '@/lib/money'
import { dismissFlag, killFlag, remindFlag } from './actions'

export interface ReviewFlag {
  id: string
  type: string
  severity: string
  explanation: string
  estimatedAnnualSavingsCents: number
  merchantName: string
  logoDomain: string | null
  cadence: string
  currentAmountCents: number
}

const FLAG_LABEL: Record<string, string> = {
  DUPLICATE: 'Duplicate plan',
  OVERLAP: 'Overlapping tool',
  ZOMBIE: 'Zombie charge',
  PRICE_HIKE: 'Price hike',
  TRIAL_CONVERTED: 'Trial converted',
  FORGOTTEN_ANNUAL: 'Renewal ahead',
}

const CADENCE_LABEL: Record<string, string> = {
  MONTHLY: '/mo',
  ANNUAL: '/yr',
  QUARTERLY: '/qtr',
  WEEKLY: '/wk',
  IRREGULAR: '/mo avg',
}

export function ReviewDeck({ flags }: { flags: ReviewFlag[] }) {
  // Snapshot the queue once: server revalidation shrinks the incoming
  // prop as flags are handled, and reading it live would skip cards.
  const [queue] = useState(flags)
  const [index, setIndex] = useState(0)
  const [killedCents, setKilledCents] = useState(0)
  const [pending, startTransition] = useTransition()

  const current = queue[index]
  const done = index >= queue.length

  const act = useCallback(
    (action: (id: string) => Promise<void>, savings = 0): void => {
      if (!current || pending) return
      startTransition(async () => {
        await action(current.id)
        if (savings > 0) setKilledCents((c) => c + savings)
        setIndex((i) => i + 1)
      })
    },
    [current, pending, startTransition],
  )

  // Tinder-style keyboard triage: 1/← keep, 2 remind, 3/→ kill.
  useEffect(() => {
    if (!current) return
    function onKey(e: KeyboardEvent): void {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
      if (e.key === '1' || e.key === 'ArrowLeft') act(dismissFlag)
      else if (e.key === '2') act(remindFlag)
      else if (e.key === '3' || e.key === 'ArrowRight') act(killFlag, current.estimatedAnnualSavingsCents)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [act, current])

  if (done || !current) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-5xl">🎉</p>
        <h1 className="mt-4 text-2xl font-bold">That&apos;s the whole queue</h1>
        {killedCents > 0 && (
          <p className="num mt-2 text-lg text-savings">
            {formatMoney(killedCents)}/yr sent to the Kill List this session.
          </p>
        )}
        <a
          href="/dashboard/killlist"
          className="mt-6 rounded-lg bg-savings px-6 py-3 font-semibold text-ink-950 transition hover:bg-savings-glow"
        >
          Open the Kill List
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col justify-center">
      <div className="flex items-center justify-between text-sm text-ink-400">
        <p>
          Flag {index + 1} of {queue.length}
        </p>
        {killedCents > 0 && (
          <p className="num text-savings">{formatMoney(killedCents)}/yr killed</p>
        )}
      </div>

      <div className="mt-3 rounded-2xl border border-ink-800 bg-ink-900 p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <MerchantLogo domain={current.logoDomain} name={current.merchantName} size={44} />
          <div className="min-w-0">
            <p className="text-xl font-bold">{current.merchantName}</p>
            <p className="num text-sm text-ink-400">
              {formatMoney(current.currentAmountCents)}
              {CADENCE_LABEL[current.cadence] ?? ''}
            </p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-flame/15 px-3 py-1 text-xs font-semibold text-flame">
            {FLAG_LABEL[current.type] ?? current.type}
          </span>
        </div>

        <p className="mt-6 text-lg leading-relaxed text-ink-200">
          {current.explanation}
        </p>

        <p className="num mt-6 text-3xl font-bold text-savings">
          {formatMoney(current.estimatedAnnualSavingsCents)}
          <span className="text-base font-medium text-ink-400">/yr at stake</span>
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => act(dismissFlag)}
            className="rounded-xl border border-ink-700 px-4 py-3 text-sm font-semibold text-ink-200 transition hover:border-ink-500 hover:bg-ink-800 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-1.5">
              We use it <Kbd>1</Kbd>
            </span>
            <span className="mt-0.5 block text-xs font-normal text-ink-500">keep &amp; confirm</span>
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => act(remindFlag)}
            className="rounded-xl border border-ink-700 px-4 py-3 text-sm font-semibold text-ink-200 transition hover:border-ink-500 hover:bg-ink-800 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-1.5">
              Remind me <Kbd>2</Kbd>
            </span>
            <span className="mt-0.5 block text-xs font-normal text-ink-500">at renewal</span>
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => act(killFlag, current.estimatedAnnualSavingsCents)}
            className="rounded-xl bg-flame px-4 py-3 text-sm font-bold text-ink-950 transition hover:bg-flame-soft disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-1.5">
              Kill it <Kbd dark>3</Kbd>
            </span>
            <span className="mt-0.5 block text-xs font-medium text-ink-950/70">add to Kill List</span>
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-ink-500">
        Tip: use <Kbd>1</Kbd> <Kbd>2</Kbd> <Kbd>3</Kbd> or <Kbd>←</Kbd> <Kbd>→</Kbd> to fly through the queue.
      </p>
    </div>
  )
}

function Kbd({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <kbd
      className={`inline-flex min-w-[1.25rem] items-center justify-center rounded border px-1 py-0.5 text-[10px] font-semibold ${
        dark
          ? 'border-ink-950/30 bg-ink-950/10 text-ink-950/70'
          : 'border-ink-700 bg-ink-950 text-ink-400'
      }`}
    >
      {children}
    </kbd>
  )
}
