import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { siteConfig } from '@/lib/content'

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-6xl">Síða fannst ekki</h1>
        <p className="mt-5 max-w-md text-ink-muted">
          Þessi síða virðist ekki vera á matseðlinum. Skoðaðu forsíðuna eða pantaðu borð — við
          tökum vel á móti þér.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/" className="btn-primary">
            Á forsíðu
          </Link>
          <Link href={siteConfig.hero.ctaHref} className="btn-ghost">
            {siteConfig.hero.cta}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
