export default function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} af 5 stjörnum`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={i <= rating ? 'text-accent' : 'text-ink-muted/30'}
          fill="currentColor"
        >
          <path d="M12 2l2.94 6.26 6.87.88-5.05 4.73 1.3 6.79L12 17.35l-6.06 3.31 1.3-6.79-5.05-4.73 6.87-.88L12 2z" />
        </svg>
      ))}
    </div>
  )
}
