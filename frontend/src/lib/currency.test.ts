import { describe, expect, it } from 'vitest'
import { formatMoney, parseMoney } from './currency'

describe('parseMoney', () => {
  it('parses a decimal string from the backend', () => {
    expect(parseMoney('29.99')).toBe(29.99)
  })

  it('falls back to 0 for a non-numeric string', () => {
    expect(parseMoney('not-a-number')).toBe(0)
  })
})

describe('formatMoney', () => {
  it('formats a string price as currency', () => {
    expect(formatMoney('29.99')).toContain('29.99')
  })

  it('formats a number price as currency', () => {
    expect(formatMoney(45.5)).toContain('45.50')
  })
})
