import Image from 'next/image'
import { siteConfig } from '@/lib/content'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'

export default function Gallery() {
  const { gallery } = siteConfig
  return (
    <section id="svipmyndir" className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading kicker={gallery.kicker} heading={gallery.heading} />

      <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {gallery.images.map((image, i) => (
          <Reveal key={image.src} delay={i * 90}>
            <div className="group relative aspect-square overflow-hidden rounded-xl">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
