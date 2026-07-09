import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { authenticateOwner, ownerLoginEnabled } from '../owner-login'

/**
 * The rejection paths return before touching the database, so they are
 * unit-testable. The success path (which upserts a User) is exercised by
 * the end-to-end sign-in flow.
 */
describe('owner login', () => {
  const original = { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }

  beforeEach(() => {
    process.env.ADMIN_EMAIL = 'owner@example.com'
    process.env.ADMIN_PASSWORD = 'correct-horse-battery-staple'
  })
  afterEach(() => {
    process.env.ADMIN_EMAIL = original.email
    process.env.ADMIN_PASSWORD = original.password
  })

  it('is enabled only when both vars are set', () => {
    expect(ownerLoginEnabled()).toBe(true)
    delete process.env.ADMIN_PASSWORD
    expect(ownerLoginEnabled()).toBe(false)
  })

  it('rejects a wrong password', async () => {
    expect(await authenticateOwner('owner@example.com', 'nope')).toBeNull()
  })

  it('rejects a wrong email', async () => {
    expect(await authenticateOwner('someone@else.com', 'correct-horse-battery-staple')).toBeNull()
  })

  it('rejects non-string input (no injection through the credentials form)', async () => {
    expect(await authenticateOwner({ not: 'a string' }, 'correct-horse-battery-staple')).toBeNull()
    expect(await authenticateOwner('owner@example.com', ['array'])).toBeNull()
  })

  it('returns null (never throws) when owner login is disabled', async () => {
    delete process.env.ADMIN_EMAIL
    delete process.env.ADMIN_PASSWORD
    expect(await authenticateOwner('owner@example.com', 'correct-horse-battery-staple')).toBeNull()
  })
})
