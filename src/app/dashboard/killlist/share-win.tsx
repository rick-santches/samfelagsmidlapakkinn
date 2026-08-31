'use client'

import { useState } from 'react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zombly.vercel.app'

const money = (cents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(cents / 100))

export function ShareWin({ cents, count }: { cents: number; count: number }) {
  const [copied, setCopied] = useState(false)

  const message =
    `I just found ${money(cents)}/yr of zombie subscriptions with Zombly 🧟 — ` +
    `${count} killed. Find yours: ${APP_URL}`

  function share(): void {
    if (!navigator.clipboard) return
    void navigator.clipboard.writeText(message).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      type="button"
      onClick={share}
      title="Copy a shareable summary of your savings"
      className="rounded-lg border border-ink-700 px-4 py-2 text-sm font-semibold text-ink-200 transition hover:border-savings hover:text-savings print:hidden"
    >
      {copied ? 'Copied to clipboard ✓' : 'Share your win'}
    </button>
  )
}
