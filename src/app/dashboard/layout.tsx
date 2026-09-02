import Link from 'next/link'
import { signOut } from '@/auth'
import { DashboardNav } from '@/components/dashboard-nav'
import { ZomblyMark } from '@/components/zombly-mark'
import { requireOrg } from '@/lib/session'

async function signOutAction(): Promise<void> {
  'use server'
  await signOut({ redirectTo: '/' })
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { org, user } = await requireOrg()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-ink-800 bg-ink-900 px-4 py-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 text-lg font-bold tracking-tight"
        >
          <ZomblyMark size={22} />
          <span className="text-savings">Zombly</span>
        </Link>
        <p className="mt-1 truncate px-2 text-xs text-ink-400">{org.name}</p>

        <DashboardNav />

        <div className="border-t border-ink-800 pt-4">
          <p className="truncate px-2 text-xs text-ink-400">{user.email}</p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-sm text-ink-300 transition hover:bg-ink-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
    </div>
  )
}
