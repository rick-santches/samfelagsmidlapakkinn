import { siteConfig } from '@/lib/content'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'

export function formatPrice(price: number): string {
  return `${price.toLocaleString('is-IS')} kr.`
}

export default function Menu() {
  const { menu } = siteConfig
  return (
    <section id="matsedill" className="bg-surface/50 py-24 sm:py-32">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <SectionHeading kicker={menu.kicker} heading={menu.heading} />

        <div className="mx-auto mt-16 max-w-3xl space-y-16">
          {menu.categories.map((category, ci) => (
            <Reveal key={category.title} delay={ci * 80}>
              <div>
                <h3 className="mb-8 flex items-center gap-4 font-display text-2xl font-bold text-accent">
                  {category.title}
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                </h3>
                <ul className="space-y-7">
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <div className="flex items-baseline justify-between gap-3">
                        <h4 className="flex items-baseline gap-2.5 font-display text-lg font-semibold">
                          {item.name}
                          {item.tag && (
                            <span className="whitespace-nowrap rounded-full bg-accent-soft px-2.5 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide text-accent">
                              {item.tag}
                            </span>
                          )}
                        </h4>
                        <span
                          className="mx-1 hidden flex-1 border-b border-dotted border-line sm:block"
                          aria-hidden="true"
                        />
                        <p className="shrink-0 font-semibold text-accent">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="mt-1 max-w-xl text-sm text-ink-muted">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mx-auto mt-14 max-w-3xl text-center text-sm italic text-ink-muted">
            {menu.note}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
