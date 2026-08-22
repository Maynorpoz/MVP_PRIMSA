import { describe, expect, it } from 'vitest'
import { AxiosError } from 'axios'
import { getStatusCode, toUserMessage } from './errors'

function makeAxiosError(status: number, data: unknown): AxiosError {
  const error = new AxiosError('Request failed')
  error.response = {
    status,
    data,
    statusText: '',
    headers: {},
    // @ts-expect-error - minimal fake config, not used by the code under test
    config: {},
  }
  return error
}

describe('toUserMessage', () => {
  it('surfaces a plain string detail (400/401/403/404)', () => {
    const error = makeAxiosError(400, { detail: "Insufficient stock for product 'Filtro de Aceite'" })
    expect(toUserMessage(error)).toBe("Insufficient stock for product 'Filtro de Aceite'")
  })

  it('falls back to a generic message when detail is a validation-error array (422)', () => {
    const error = makeAxiosError(422, { detail: [{ loc: ['body', 'email'], msg: 'invalid' }] })
    expect(toUserMessage(error)).toBe('Ocurrió un error inesperado. Intenta de nuevo.')
  })

  it('uses the provided fallback for a non-axios error', () => {
    expect(toUserMessage(new Error('network down'), 'Fallback')).toBe('Fallback')
  })
})

describe('getStatusCode', () => {
  it('reads the status from an axios error', () => {
    expect(getStatusCode(makeAxiosError(404, {}))).toBe(404)
  })

  it('returns undefined for a non-axios error', () => {
    expect(getStatusCode(new Error('boom'))).toBeUndefined()
  })
})
