import Image from 'next/image'
import { siteConfig } from '@/lib/content'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'

export default function About() {
  const { about, images } = siteConfig
  return (
    <section id="um-okkur" className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading kicker={about.kicker} heading={about.heading} align="left" />
          <div className="mt-8 space-y-5">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 100}>
                <p className="leading-relaxed text-ink-muted">{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}>
            <dl className="mt-10 grid grid-cols-3 gap-4">
              {about.highlights.map((h) => (
                <div
                  key={h.label}
                  className="rounded-xl border border-line bg-surface p-4 text-center"
                >
                  <dt className="order-2 mt-1 block text-xs text-ink-muted">{h.label}</dt>
                  <dd className="font-display text-2xl font-bold text-accent sm:text-3xl">
                    {h.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src={images.about}
              alt={`Réttur frá ${siteConfig.name}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
