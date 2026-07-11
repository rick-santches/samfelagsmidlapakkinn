/** The Zombly mark: acid-green tile, bold Z, one bite taken out. */
export function ZomblyMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="64" height="64" rx="14" fill="#A3E635" />
      <path d="M17 15 H47 V24 L30.5 40 H47 V49 H17 V40 L33.5 24 H17 Z" fill="#0A0E14" />
      <circle cx="47" cy="15" r="7" fill="#A3E635" />
      <circle cx="41" cy="13" r="2.4" fill="#A3E635" />
    </svg>
  )
}
