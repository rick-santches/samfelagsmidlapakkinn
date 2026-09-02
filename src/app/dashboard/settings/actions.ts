'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { planSpec } from '@/lib/plans'
import { requireOrg } from '@/lib/session'

/**
 * Add a teammate by email. With magic-link auth there's nothing to
 * "invite": we create (or find) the user and attach a membership — the
 * moment they sign in with that email, they're in the org.
 */
export async function addMember(formData: FormData): Promise<void> {
  const { org, role } = await requireOrg()
  if (role !== 'OWNER') throw new Error('Only the owner can add teammates')

  const parsed = z.string().trim().toLowerCase().email().safeParse(formData.get('email'))
  if (!parsed.success) return
  const email = parsed.data

  const seatCount = await prisma.membership.count({ where: { orgId: org.id } })
  if (seatCount >= planSpec(org.plan).seats) {
    throw new Error('Seat limit reached for this plan')
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  })
  const existing = await prisma.membership.findFirst({
    where: { userId: user.id, orgId: org.id },
  })
  if (!existing) {
    await prisma.membership.create({
      data: { userId: user.id, orgId: org.id, role: 'MEMBER' },
    })
  }
  revalidatePath('/dashboard/settings')
}

/** Remove a teammate (owner only; owners can't remove themselves here). */
export async function removeMember(formData: FormData): Promise<void> {
  const { org, role, user } = await requireOrg()
  if (role !== 'OWNER') throw new Error('Only the owner can remove teammates')

  const membershipId = formData.get('membershipId')
  if (typeof membershipId !== 'string') return

  await prisma.membership.deleteMany({
    where: {
      id: membershipId,
      orgId: org.id,
      role: 'MEMBER', // owners are never removable through this path
      NOT: { userId: user.id },
    },
  })
  revalidatePath('/dashboard/settings')
}

export async function updateAlertPrefs(formData: FormData): Promise<void> {
  const { user, org } = await requireOrg()
  await prisma.membership.updateMany({
    where: { userId: user.id, orgId: org.id },
    data: {
      emailInstantAlerts: formData.get('instant') === 'on',
      emailWeeklyDigest: formData.get('digest') === 'on',
    },
  })
  revalidatePath('/dashboard/settings')
}
