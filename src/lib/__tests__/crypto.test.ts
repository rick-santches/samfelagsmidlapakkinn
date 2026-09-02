import { beforeAll, describe, expect, it } from 'vitest'
import { decryptSecret, encryptSecret } from '../crypto'

describe('secret encryption (Plaid access tokens at rest)', () => {
  beforeAll(() => {
    process.env.AUTH_SECRET = 'test-secret-for-crypto-round-trip'
  })

  it('round-trips a token', () => {
    const token = 'access-sandbox-abc123-def456'
    const stored = encryptSecret(token)
    expect(stored).not.toContain(token)
    expect(stored.startsWith('v1:')).toBe(true)
    expect(decryptSecret(stored)).toBe(token)
  })

  it('produces a different ciphertext every time (random IV)', () => {
    expect(encryptSecret('same-input')).not.toBe(encryptSecret('same-input'))
  })

  it('rejects tampered ciphertext', () => {
    const stored = encryptSecret('access-sandbox-abc123')
    const parts = stored.split(':')
    const data = Buffer.from(parts[3]!, 'base64')
    data[0] = data[0]! ^ 0xff
    const tampered = [parts[0], parts[1], parts[2], data.toString('base64')].join(':')
    expect(() => decryptSecret(tampered)).toThrow()
  })
})
