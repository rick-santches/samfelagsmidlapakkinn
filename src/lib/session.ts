import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import type { MembershipRole, Organization } from '@prisma/client'
import { prisma } from './db'

export interface SessionUser {
  id: string
  email: string
  name: string | null
}

/** Resolve the signed-in user or bounce to /signin. */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth()
  const user = session?.user
  if (!user?.id || !user.email) redirect('/signin')
  return { id: user.id, email: user.email, name: user.name ?? null }
}

export interface OrgContext {
  user: SessionUser
  org: Organization
  role: MembershipRole
}

/**
 * The one true entry point for every dashboard page and API route:
 * authenticated user + their org (owners first, oldest membership wins).
 * No org yet → onboarding.
 */
export async function requireOrg(): Promise<OrgContext> {
  const user = await requireUser()
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { org: true },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  })
  if (!membership) redirect('/welcome')
  return { user, org: membership.org, role: membership.role }
}
