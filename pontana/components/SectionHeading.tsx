import Reveal from './Reveal'

export default function SectionHeading({
  kicker,
  heading,
  align = 'center',
}: {
  kicker: string
  heading: string
  align?: 'center' | 'left'
}) {
  return (
    <Reveal className={align === 'center' ? 'text-center' : 'text-left'}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
        {kicker}
      </p>
      <h2 className="font-display text-3xl font-bold sm:text-5xl">{heading}</h2>
    </Reveal>
  )
}
