'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Animated count-up for hero money numbers. Respects
 * prefers-reduced-motion by jumping straight to the value.
 */
export function CountUp({
  cents,
  className,
  whole = false,
}: {
  cents: number
  className?: string
  whole?: boolean
}) {
  const [display, setDisplay] = useState(0)
  const frame = useRef<number>()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(cents)
      return
    }
    const duration = 900
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(cents * eased))
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [cents])

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: whole ? 0 : 2,
    minimumFractionDigits: whole ? 0 : 2,
  })

  return <span className={`num ${className ?? ''}`}>{formatter.format(display / 100)}</span>
}
