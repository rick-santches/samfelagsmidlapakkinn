import type { Config } from 'tailwindcss'

/**
 * Brand colors are NOT hardcoded here — they resolve to CSS variables
 * injected in app/layout.tsx from lib/content.ts (siteConfig.colors).
 * Re-skinning a client site never requires touching this file.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // RGB-channel vars so Tailwind opacity modifiers (e.g. bg-surface/95) work
        base: 'rgb(var(--color-base-rgb) / <alpha-value>)',
        surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
        ink: 'rgb(var(--color-ink-rgb) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted-rgb) / <alpha-value>)',
        // Already-translucent values — used without opacity modifiers
        'accent-soft': 'var(--color-accent-soft)',
        line: 'var(--color-line)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
}

export default config
