'use client'

import { useEffect } from 'react'

/**
 * Adds an `.in` class to every `.reveal` element as it scrolls into view, so
 * sections rise in once. No-op (everything visible) for reduced-motion or
 * browsers without IntersectionObserver.
 */
export function RevealController() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      els.forEach((e) => e.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
  return null
}
