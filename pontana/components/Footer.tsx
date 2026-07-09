import { siteConfig } from '@/lib/content'

export default function Footer() {
  const { name, footer, social, hours, contact } = siteConfig
  return (
    <footer className="border-t border-line bg-surface/60">
      <div className="mx-auto max-w-content px-5 py-12 sm:px-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-xl font-bold">{name}</p>
            <p className="mt-1 text-sm text-ink-muted">{footer.note}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {hours.address.street}, {hours.address.postalCode} {hours.address.city} ·{' '}
              <a href={contact.phoneHref} className="transition-colors hover:text-ink">
                s. {contact.phone}
              </a>
            </p>
          </div>
          <ul className="flex items-center gap-5">
            {social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink-muted transition-colors hover:text-accent"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-10 border-t border-line pt-6 text-center">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} {name} ·{' '}
            <a
              href={footer.madeByUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-accent"
            >
              {footer.madeBy}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
