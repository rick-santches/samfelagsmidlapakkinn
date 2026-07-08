'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireOrg } from '@/lib/session'

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
