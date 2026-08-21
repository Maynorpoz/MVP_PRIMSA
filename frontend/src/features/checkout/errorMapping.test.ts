import { describe, expect, it } from 'vitest'
import { findAffectedProductId } from './errorMapping'

const cartItems = [
  { productId: 1, name: 'Camisa Primsa Classic' },
  { productId: 2, name: 'Pantalón Primsa Slim' },
]

describe('findAffectedProductId', () => {
  it('matches by product name (insufficient stock message)', () => {
    const detail = "Insufficient stock for product 'Camisa Primsa Classic'"
    expect(findAffectedProductId(detail, cartItems)).toBe(1)
  })

  it('matches by id in "product <id>" phrasing (invalid quantity message)', () => {
    const detail = 'Invalid quantity for product 2'
    expect(findAffectedProductId(detail, cartItems)).toBe(2)
  })

  it('matches by id in a bracketed list (product not found message)', () => {
    const detail = 'Products not found: [2]'
    expect(findAffectedProductId(detail, cartItems)).toBe(2)
  })

  it('returns null when nothing in the cart matches', () => {
    const detail = 'Products not found: [999]'
    expect(findAffectedProductId(detail, cartItems)).toBeNull()
  })

  it('returns null for a message unrelated to any product (e.g. empty order)', () => {
    const detail = 'An order must contain at least one item'
    expect(findAffectedProductId(detail, cartItems)).toBeNull()
  })
})
