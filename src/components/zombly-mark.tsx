/**
 * The Zombly mark: a statement being swiped away — line-art receipt,
 * slash, and pointing hand in brand green, framed in a ring tile.
 */
export function ZomblyMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="1.5" y="1.5" width="61" height="61" rx="13" fill="#0F141C" stroke="#A3E635" strokeWidth="2.4" />
      <rect x="16" y="10" width="23" height="32" rx="3" fill="#0F141C" stroke="#A3E635" strokeWidth="3.2" strokeLinejoin="round" />
      <line x1="50" y1="8" x2="12" y2="46" stroke="#A3E635" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M31 24.5 a3.25 3.25 0 0 1 6.5 0 L37.5 35.5
           q2.3 -2 4.6 -0.2 q2.3 -1.8 4.4 0.4 q2.5 1.3 2.5 4.2 v3.1
           q0 7.5 -7.5 7.5 h-4.2 q-5.4 0 -7.4 -4.7 l-3.3 -7.2
           q-1.1 -2.4 1.1 -3.3 q2.1 -0.85 3.3 1.15 l0.5 0.85 Z"
        fill="#0F141C"
        stroke="#A3E635"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
