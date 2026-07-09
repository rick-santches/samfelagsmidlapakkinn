'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/content'

/**
 * Sticky nav: translucent over the hero, solidifies on scroll.
 * Collapses to a hamburger menu on mobile.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the nav link of the section currently in the middle of the
  // viewport (home page only — elsewhere the sections don't exist)
  useEffect(() => {
    const sections = siteConfig.nav
      .map((item) => item.href.split('#')[1])
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? 'border-b border-line bg-surface/95 shadow-lg backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <nav
        aria-label="Aðalvalmynd"
        className="mx-auto flex h-16 max-w-content items-center justify-between px-5 sm:px-8"
      >
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-wide text-ink transition-colors hover:text-accent"
          onClick={() => setOpen(false)}
        >
          {siteConfig.name}
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 md:flex">
          {siteConfig.nav.map((item) => {
            const isActive = activeId !== null && item.href.endsWith(`#${activeId}`)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'true' : undefined}
                className={`text-sm transition-colors hover:text-ink ${
                  isActive ? 'font-semibold text-accent' : 'text-ink-muted'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <Link href={siteConfig.hero.ctaHref} className="btn-primary !px-5 !py-2.5">
            {siteConfig.hero.cta}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink md:hidden"
          aria-expanded={open}
          aria-label={open ? 'Loka valmynd' : 'Opna valmynd'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line px-5 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 text-ink-muted transition-colors hover:bg-accent-soft hover:text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={siteConfig.hero.ctaHref}
              className="btn-primary mt-3"
              onClick={() => setOpen(false)}
            >
              {siteConfig.hero.cta}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
