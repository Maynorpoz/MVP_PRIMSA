import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ProductOut } from '@/types/catalog'
import { parseMoney } from '@/lib/currency'

export interface CartItem {
  product: ProductOut
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  subtotal: number
  itemCount: number
  /** Adds `quantity` units, clamped to the product's known stock (UX only —
   * the backend re-validates on checkout; see ARQUITECTURA.md section 6). */
  addItem: (product: ProductOut, quantity?: number) => void
  setQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((product: ProductOut, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id)
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, product.stock)
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQuantity } : item,
        )
      }
      return [...current, { product, quantity: Math.min(quantity, product.stock) }]
    })
  }, [])

  // Decrementing to 0 removes the line (standard cart stepper behavior);
  // `removeItem` below is just an explicit shortcut for the same thing.
  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, Math.min(quantity, item.product.stock)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems((current) => current.filter((item) => item.product.id !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + parseMoney(item.product.price) * item.quantity, 0),
    [items],
  )

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const value: CartContextValue = {
    items,
    subtotal,
    itemCount,
    addItem,
    setQuantity,
    removeItem,
    clear,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
