import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/lib/content'
import Reveal from './Reveal'

export default function Hero() {
  const { name, tagline, hero, images } = siteConfig
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <Image
        src={images.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Gradient scrim for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgb(var(--color-base-rgb) / 0.55) 0%, rgb(var(--color-base-rgb) / 0.35) 40%, var(--color-base) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-content px-5 py-32 text-center sm:px-8">
        <Reveal>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-accent sm:text-sm">
            {hero.kicker}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="font-display text-5xl font-bold leading-tight sm:text-7xl lg:text-8xl">
            {name}
          </h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink/90 sm:text-xl">{tagline}</p>
        </Reveal>
        <Reveal delay={360}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={hero.ctaHref} className="btn-primary w-full sm:w-auto">
              {hero.cta}
            </Link>
            <Link href={hero.secondaryCtaHref} className="btn-ghost w-full sm:w-auto">
              {hero.secondaryCta}
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-ink-muted"
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  )
}
