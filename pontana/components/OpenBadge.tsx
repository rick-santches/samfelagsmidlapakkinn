'use client'

import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/content'

interface BadgeState {
  isOpen: boolean
  text: string
}

/** Current weekday (0–6) and minutes-since-midnight in Reykjavik time. */
function nowInReykjavik(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Atlantic/Reykjavik',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { day: dayIndex, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function computeState(): BadgeState {
  const { schedule, badge } = siteConfig.hours
  const { day, minutes } = nowInReykjavik()
  const ruleFor = (d: number) => schedule.find((s) => s.dayNumbers.includes(d))

  const today = ruleFor(day)
  if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { isOpen: true, text: `${badge.open} · ${badge.closesAt} ${today.close}` }
  }
  // Closed: next opening is either later today or the next day with a rule
  if (today && minutes < toMinutes(today.open)) {
    return { isOpen: false, text: `${badge.closed} · ${badge.opensAt} ${today.open}` }
  }
  for (let offset = 1; offset <= 7; offset++) {
    const next = ruleFor((day + offset) % 7)
    if (next) {
      return { isOpen: false, text: `${badge.closed} · ${badge.opensAt} ${next.open}` }
    }
  }
  return { isOpen: false, text: badge.closed }
}

/**
 * Live "Opið núna / Lokað" badge based on siteConfig.hours.schedule,
 * evaluated in Reykjavik time. Renders a fixed-height placeholder until
 * mounted so there is no hydration mismatch or layout shift.
 */
export default function OpenBadge() {
  const [state, setState] = useState<BadgeState | null>(null)

  useEffect(() => {
    setState(computeState())
    const timer = setInterval(() => setState(computeState()), 60_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <span
      className={`inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-opacity duration-500 ${
        state ? 'opacity-100' : 'opacity-0'
      } ${
        state?.isOpen === false
          ? 'border-line text-ink-muted'
          : 'border-accent/40 bg-accent-soft text-accent'
      }`}
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 rounded-full ${
          state?.isOpen === false ? 'bg-ink-muted' : 'animate-pulse bg-accent'
        }`}
        aria-hidden="true"
      />
      {state?.text ?? '…'}
    </span>
  )
}
