'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/subscriptions', label: 'Subscriptions' },
  { href: '/dashboard/review', label: 'Review' },
  { href: '/dashboard/killlist', label: 'Kill List' },
  { href: '/dashboard/sources', label: 'Sources' },
  { href: '/dashboard/settings', label: 'Settings' },
] as const

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="mt-8 flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        // Exact match for the root so it doesn't light up on every subpage;
        // prefix match elsewhere so detail pages keep their section active.
        const active =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
              active
                ? 'bg-ink-800 font-semibold text-savings'
                : 'text-ink-200 hover:bg-ink-800 hover:text-ink-100'
            }`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-savings' : 'bg-transparent'}`}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
