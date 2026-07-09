import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/content'

/**
 * Generated Open Graph share card. Built entirely from siteConfig
 * (name, tagline, colors), so it re-skins automatically with the site —
 * no designer needed for a new client.
 */

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  const c = siteConfig.colors
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c.base,
          backgroundImage: `radial-gradient(circle at 50% 120%, ${c.surface} 0%, ${c.base} 65%)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 14,
            textTransform: 'uppercase',
            color: c.accent,
            marginBottom: 28,
          }}
        >
          {siteConfig.hero.kicker}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 132,
            fontWeight: 700,
            color: c.ink,
            lineHeight: 1.05,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: 'flex',
            width: 88,
            height: 4,
            backgroundColor: c.accent,
            borderRadius: 2,
            marginTop: 36,
            marginBottom: 36,
          }}
        />
        <div style={{ display: 'flex', fontSize: 38, color: c.inkMuted }}>
          {siteConfig.tagline}
        </div>
      </div>
    ),
    size
  )
}
