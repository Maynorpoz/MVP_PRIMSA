import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CartProvider, useCart } from './CartContext'
import type { ProductOut } from '@/types/catalog'

function product(overrides: Partial<ProductOut> = {}): ProductOut {
  return {
    id: 1,
    name: 'Camisa Primsa Classic',
    description: null,
    price: '29.99',
    stock: 3,
    ...overrides,
  }
}

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}

describe('useCart', () => {
  it('adds a product and computes the subtotal', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(product(), 2))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.subtotal).toBeCloseTo(59.98)
    expect(result.current.itemCount).toBe(2)
  })

  it('clamps the quantity to the product stock (UX guard, not the real check)', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(product({ stock: 3 }), 10))

    expect(result.current.items[0].quantity).toBe(3)
  })

  it('merges a repeated addItem into the existing line', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(product({ stock: 5 }), 1))
    act(() => result.current.addItem(product({ stock: 5 }), 2))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
  })

  it('removes an item that reaches quantity 0 via setQuantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(product(), 1))
    act(() => result.current.setQuantity(1, 0))

    expect(result.current.items).toHaveLength(0)
  })

  it('clears the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(product(), 1))
    act(() => result.current.clear())

    expect(result.current.items).toHaveLength(0)
    expect(result.current.subtotal).toBe(0)
  })
})
