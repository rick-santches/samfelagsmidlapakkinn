'use client'

import Link from 'next/link'
import { useState } from 'react'
import { siteConfig } from '@/lib/content'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function BookingForm() {
  const { booking } = siteConfig
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'booking', ...data }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-10 text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft"
          aria-hidden="true"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold">{booking.form.successHeading}</h2>
        <p className="mt-3 text-ink-muted">{booking.form.successMessage}</p>
        <Link href="/" className="btn-ghost mt-8">
          {booking.backLabel}
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-line bg-surface p-6 sm:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-date" className="field-label">
            {booking.form.dateLabel}
          </label>
          <input id="booking-date" name="date" type="date" required className="field-input" />
        </div>
        <div>
          <label htmlFor="booking-time" className="field-label">
            {booking.form.timeLabel}
          </label>
          <input id="booking-time" name="time" type="time" required className="field-input" />
        </div>
      </div>

      <div>
        <label htmlFor="booking-guests" className="field-label">
          {booking.form.guestsLabel}
        </label>
        <select id="booking-guests" name="guests" required className="field-input">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'gestur' : booking.form.guestsSuffix}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-name" className="field-label">
            {booking.form.nameLabel}
          </label>
          <input
            id="booking-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="booking-phone" className="field-label">
            {booking.form.phoneLabel}
          </label>
          <input
            id="booking-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className="field-input"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? booking.form.sendingLabel : booking.form.submitLabel}
      </button>

      <p aria-live="polite" className="min-h-[1.25rem] text-center text-sm">
        {status === 'error' && (
          <span className="text-red-400">{booking.form.errorMessage}</span>
        )}
      </p>
    </form>
  )
}
