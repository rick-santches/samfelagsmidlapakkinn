import { createHash, timingSafeEqual } from 'crypto'
import { prisma } from './db'

/**
 * Optional built-in owner login: a single operator account defined by
 * ADMIN_EMAIL + ADMIN_PASSWORD env vars. It gives every deploy a
 * guaranteed, email-free way in — without the log-leak risk of printing
 * magic links. Enabled only when both vars are set.
 */
export function ownerLoginEnabled(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD)
}

/** Constant-time compare via fixed-length digests (avoids length leaks). */
function secretsMatch(a: string, b: string): boolean {
  const da = createHash('sha256').update(a).digest()
  const db = createHash('sha256').update(b).digest()
  return timingSafeEqual(da, db)
}

/**
 * Validate a credentials login against the configured owner account.
 * On success, upsert the User row so downstream session/org lookups
 * (which query by userId) have a real record, and return it.
 */
export async function authenticateOwner(
  email: unknown,
  password: unknown,
): Promise<{ id: string; email: string; name: string | null } | null> {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) return null
  if (typeof email !== 'string' || typeof password !== 'string') return null

  const emailOk = secretsMatch(email.trim().toLowerCase(), adminEmail.trim().toLowerCase())
  const passwordOk = secretsMatch(password, adminPassword)
  // Evaluate both regardless of the first result to keep timing flat.
  if (!emailOk || !passwordOk) return null

  const normalized = adminEmail.trim().toLowerCase()
  const user = await prisma.user.upsert({
    where: { email: normalized },
    update: { emailVerified: new Date() },
    create: { email: normalized, name: 'Owner', emailVerified: new Date() },
  })
  return { id: user.id, email: user.email, name: user.name }
}
