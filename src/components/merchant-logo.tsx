'use client'

import { useState } from 'react'
import { logoUrl } from '@/lib/engine/merchants'

/**
 * Merchant logo with graceful fallback: if the logo CDN misses (or is
 * unreachable), show a letter avatar instead of a broken image.
 */
export function MerchantLogo({
  domain,
  name,
  size = 24,
}: {
  domain: string | null
  name: string
  size?: number
}) {
  const [failed, setFailed] = useState(false)

  if (!domain || failed) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded bg-ink-800 text-xs font-medium text-ink-400"
      >
        {name.charAt(0)}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl(domain)}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded"
      onError={() => setFailed(true)}
    />
  )
}
