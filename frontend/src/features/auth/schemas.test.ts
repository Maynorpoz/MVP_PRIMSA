import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './schemas'

describe('loginSchema', () => {
  it('accepts a valid email and non-empty password', () => {
    const result = loginSchema.safeParse({ email: 'ana@correo.com', password: 'x' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const base = { email: 'ana@correo.com', password: 'longenough1' }

  it('accepts matching passwords of at least 8 characters', () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: base.password })
    expect(result.success).toBe(true)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      email: base.email,
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched confirmation', () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: 'different1' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword'])
    }
  })

  it('rejects a payload carrying a role field (extra keys are stripped, never trusted)', () => {
    const result = registerSchema.safeParse({
      ...base,
      confirmPassword: base.password,
      role: 'sales_admin_role',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('role')
    }
  })
})
