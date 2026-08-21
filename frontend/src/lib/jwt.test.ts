import { describe, expect, it } from 'vitest'
import { Buffer } from 'node:buffer'
import { decodeAccessToken } from './jwt'

function base64url(json: object): string {
  return Buffer.from(JSON.stringify(json)).toString('base64url')
}

function fakeJwt(payload: object): string {
  const header = base64url({ alg: 'HS256', typ: 'JWT' })
  const body = base64url(payload)
  return `${header}.${body}.fakesignature`
}

describe('decodeAccessToken', () => {
  it('decodes a valid token payload', () => {
    const token = fakeJwt({ sub: 'ana@correo.com', role: 'customer_role', exp: 9999999999 })
    expect(decodeAccessToken(token)).toEqual({
      sub: 'ana@correo.com',
      role: 'customer_role',
      exp: 9999999999,
    })
  })

  it('returns null for a malformed token instead of throwing', () => {
    expect(decodeAccessToken('not-a-jwt')).toBeNull()
  })
})
