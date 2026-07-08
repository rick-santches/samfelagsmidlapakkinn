import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/session'

async function createOrganization(formData: FormData): Promise<void> {
  'use server'
  const user = await requireUser()
  const name = formData.get('name')
  if (typeof name !== 'string' || name.trim().length < 2) return

  const existing = await prisma.membership.findFirst({ where: { userId: user.id } })
  if (!existing) {
    await prisma.organization.create({
      data: {
        name: name.trim().slice(0, 80),
        memberships: { create: { userId: user.id, role: 'OWNER' } },
      },
    })
  }
  redirect('/dashboard')
}

export default async function WelcomePage() {
  const user = await requireUser()
  const membership = await prisma.membership.findFirst({ where: { userId: user.id } })
  if (membership) redirect('/dashboard')

  const suggested = user.email.split('@')[1]?.split('.')[0] ?? ''
  const suggestedName = suggested.charAt(0).toUpperCase() + suggested.slice(1)

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">Name your organization</h1>
        <p className="mt-2 text-sm text-ink-300">
          This is the company whose subscriptions we&apos;re about to audit.
        </p>
        <form action={createOrganization} className="mt-8 space-y-3">
          <input
            type="text"
            name="name"
            required
            minLength={2}
            defaultValue={suggestedName}
            placeholder="Acme Inc."
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:border-savings focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-savings px-4 py-3 font-semibold text-ink-950 transition hover:bg-savings-glow"
          >
            Start the audit
          </button>
        </form>
      </div>
    </main>
  )
}
