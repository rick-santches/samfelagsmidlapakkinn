/** The Zombly mark: acid-green tile with a zombie bite out of the top, bold Z. */
export function ZomblyMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
    >
      <mask id="zombly-bite">
        <rect width="64" height="64" rx="14" fill="#fff" />
        <circle cx="40" cy="-1" r="8" fill="#000" />
        <circle cx="52" cy="1" r="9" fill="#000" />
        <circle cx="62" cy="8" r="8" fill="#000" />
      </mask>
      <rect width="64" height="64" rx="14" fill="#A3E635" mask="url(#zombly-bite)" />
      <path d="M15 19 H45 V28 L28.5 44 H45 V53 H15 V44 L31.5 28 H15 Z" fill="#0A0E14" />
    </svg>
  )
}
