import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import type { MembershipRole, Organization } from '@prisma/client'
import { prisma } from './db'

export interface ApiOrgContext {
  user: { id: string; email: string }
  org: Organization
  role: MembershipRole
}

/**
 * requireOrg() for API routes: returns a context or an { error } with
 * the proper status instead of redirecting.
 */
export async function requireOrgApi(): Promise<ApiOrgContext | { error: NextResponse }> {
  const session = await auth()
  const user = session?.user
  if (!user?.id || !user.email) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { org: true },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  })
  if (!membership) {
    return { error: NextResponse.json({ error: 'No organization' }, { status: 403 }) }
  }
  return {
    user: { id: user.id, email: user.email },
    org: membership.org,
    role: membership.role,
  }
}
