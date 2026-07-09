'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/content'

/**
 * Mobile-only booking bar fixed to the bottom of the viewport. Slides in
 * once the visitor scrolls past the hero (where the primary CTA lives)
 * and slides away when the contact section is on screen, so it never
 * covers the footer or the contact form's submit button.
 */
export default function StickyCta() {
  const [pastHero, setPastHero] = useState(false)
  const [contactVisible, setContactVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const contact = document.getElementById('hafa-samband')
    let observer: IntersectionObserver | undefined
    if (contact) {
      observer = new IntersectionObserver(
        ([entry]) => setContactVisible(entry.isIntersecting),
        { threshold: 0.1 }
      )
      observer.observe(contact)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer?.disconnect()
    }
  }, [])

  const show = pastHero && !contactVisible

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 md:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!show}
    >
      <div
        className="flex items-center gap-3 border-t border-line bg-surface/95 px-4 pt-3 backdrop-blur-md"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <Link href={siteConfig.hero.ctaHref} className="btn-primary flex-1 !py-3" tabIndex={show ? 0 : -1}>
          {siteConfig.hero.cta}
        </Link>
        <a
          href={siteConfig.contact.phoneHref}
          aria-label={`Hringja í ${siteConfig.name}, sími ${siteConfig.contact.phone}`}
          className="btn-ghost !px-4 !py-3"
          tabIndex={show ? 0 : -1}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  )
}
