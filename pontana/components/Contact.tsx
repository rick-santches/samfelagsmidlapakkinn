'use client'

import { useState } from 'react'
import { siteConfig } from '@/lib/content'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function Contact() {
  const { contact } = siteConfig
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'contact', ...data }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="hafa-samband" className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading kicker={contact.kicker} heading={contact.heading} />

      <div className="mx-auto mt-14 max-w-xl">
        <Reveal>
          <p className="text-center text-ink-muted">{contact.intro}</p>
          <p className="mt-4 text-center">
            <a
              href={contact.phoneHref}
              className="font-display text-2xl font-bold text-accent transition-colors hover:brightness-110"
            >
              s. {contact.phone}
            </a>
            <span className="mx-3 text-ink-muted" aria-hidden="true">
              ·
            </span>
            <a
              href={`mailto:${contact.email}`}
              className="text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
            >
              {contact.email}
            </a>
          </p>
        </Reveal>

        <Reveal delay={150}>
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="field-label">
                  {contact.form.nameLabel}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="field-label">
                  {contact.form.emailLabel}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="field-input"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-message" className="field-label">
                {contact.form.messageLabel}
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                className="field-input resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'sending' ? contact.form.sendingLabel : contact.form.submitLabel}
            </button>

            <p aria-live="polite" className="min-h-[1.5rem] text-center text-sm">
              {status === 'success' && (
                <span className="text-accent">{contact.form.successMessage}</span>
              )}
              {status === 'error' && (
                <span className="text-red-400">{contact.form.errorMessage}</span>
              )}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
