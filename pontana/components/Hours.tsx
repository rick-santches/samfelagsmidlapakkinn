import { siteConfig } from '@/lib/content'
import OpenBadge from './OpenBadge'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'

export default function Hours() {
  const { hours, contact } = siteConfig
  const { address } = hours
  return (
    <section id="opnunartimar" className="bg-surface/50 py-24 sm:py-32">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <SectionHeading kicker={hours.kicker} heading={hours.heading} />

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col justify-between gap-8 rounded-2xl border border-line bg-surface p-8">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-accent">Opnunartímar</h3>
                  <OpenBadge />
                </div>
                <dl className="mt-5 space-y-3">
                  {hours.schedule.map((s) => (
                    <div
                      key={s.days}
                      className="flex items-baseline justify-between gap-4 border-b border-line pb-3"
                    >
                      <dt className="text-sm text-ink-muted">{s.days}</dt>
                      <dd className="font-semibold tabular-nums">{s.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-accent">Staðsetning</h3>
                <address className="mt-4 space-y-1 not-italic text-ink-muted">
                  <p className="font-semibold text-ink">{address.street}</p>
                  <p>
                    {address.postalCode} {address.city}, {address.country}
                  </p>
                  <p className="pt-2">
                    <a
                      href={contact.phoneHref}
                      className="font-semibold text-accent transition-colors hover:brightness-110"
                    >
                      s. {contact.phone}
                    </a>
                  </p>
                </address>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="h-full min-h-[320px] overflow-hidden rounded-2xl border border-line">
              <iframe
                src={hours.mapEmbedUrl}
                title={hours.mapLabel}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0 grayscale-[35%] contrast-[1.05]"
                style={{ minHeight: 320 }}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
