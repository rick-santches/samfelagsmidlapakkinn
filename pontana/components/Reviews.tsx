import { siteConfig } from '@/lib/content'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import Stars from './Stars'

/**
 * <Reviews /> — styled as a self-contained, embeddable review widget.
 * This is the "Ummæli" upsell demo: it should read as a product with its
 * own chrome (header bar, aggregate score, verified badges, footer brand),
 * not just another page section.
 */
export default function Reviews() {
  const { reviews } = siteConfig
  const average =
    reviews.items.reduce((sum, r) => sum + r.rating, 0) / reviews.items.length

  return (
    <section id="umsagnir" className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading kicker={reviews.kicker} heading={reviews.heading} />

      <Reveal delay={120}>
        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          {/* Widget header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-accent-soft px-6 py-5">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="text-accent"
                >
                  <path
                    d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {reviews.widgetTitle}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">{reviews.widgetSubtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display text-3xl font-bold text-accent">
                {average.toLocaleString('is-IS', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
              <div>
                <Stars rating={Math.round(average)} />
                <p className="mt-0.5 text-xs text-ink-muted">
                  {reviews.items.length} umsagnir
                </p>
              </div>
            </div>
          </div>

          {/* Review cards */}
          <ul className="divide-y divide-line">
            {reviews.items.map((review) => (
              <li key={review.name} className="px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-bold text-accent"
                      aria-hidden="true"
                    >
                      {review.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{review.name}</p>
                      <p className="text-xs text-ink-muted">{review.date}</p>
                    </div>
                  </div>
                  <Stars rating={review.rating} size={14} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{review.text}</p>
              </li>
            ))}
          </ul>

          {/* Widget footer — product branding */}
          <div className="border-t border-line bg-base/60 px-6 py-3 text-center">
            <p className="text-xs text-ink-muted">{reviews.poweredBy}</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
