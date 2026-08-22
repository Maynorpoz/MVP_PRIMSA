import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { formatMoney } from '@/lib/currency'
import { useCart } from './CartContext'

export interface CartDrawerProps {
  /** null: no session at all. false: session exists but not a customer. */
  canCheckout: boolean
  onRequestLogin: () => void
}

export function CartDrawer({ canCheckout, onRequestLogin }: CartDrawerProps) {
  const { items, subtotal, setQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  if (!canCheckout) {
    return (
      <div className="flex w-[380px] shrink-0 flex-col items-center justify-center gap-4 bg-ink-950 p-7 text-center">
        <svg
          width={36}
          height={36}
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(55% 0.01 60)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <p className="text-sm leading-relaxed text-[oklch(70%_0.01_60)]">
          Inicia sesión para agregar productos a tu carrito y completar una compra.
        </p>
        <Button onClick={onRequestLogin}>Iniciar sesión</Button>
      </div>
    )
  }

  return (
    <div className="flex w-[380px] shrink-0 flex-col gap-5 bg-ink-950 p-7">
      <h2 className="text-lg font-semibold text-paper-50">Tu carrito</h2>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <EmptyState
            icon={
              <svg
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            }
            title="Tu carrito está vacío"
            description="Agrega productos del catálogo para comenzar tu pedido."
          />
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3 border-b border-[oklch(30%_0.02_55)] pb-4 last:border-b-0 last:pb-0"
              >
                <div className="h-14 w-14 shrink-0 rounded-sm bg-[oklch(30%_0.02_55)]" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-[13px] font-semibold text-paper-50">{product.name}</span>
                    <span className="text-[13px] font-semibold text-paper-50">
                      {formatMoney(Number(product.price) * quantity)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-[26px] items-center gap-2 rounded-sm border border-[oklch(35%_0.02_55)] px-2">
                      <button
                        type="button"
                        aria-label={`Quitar una unidad de ${product.name}`}
                        onClick={() => setQuantity(product.id, quantity - 1)}
                        className="text-[oklch(70%_0.01_60)]"
                      >
                        −
                      </button>
                      <span className="min-w-3 text-center text-xs text-paper-50">{quantity}</span>
                      <button
                        type="button"
                        aria-label={`Agregar una unidad de ${product.name}`}
                        disabled={quantity >= product.stock}
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        className="text-[oklch(70%_0.01_60)] disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="text-xs text-[oklch(65%_0.01_60)] hover:text-paper-50"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3.5 border-t border-[oklch(30%_0.02_55)] pt-4">
            <div className="flex justify-between">
              <span className="text-sm text-[oklch(70%_0.01_60)]">Subtotal</span>
              <span className="text-base font-bold text-paper-50">{formatMoney(subtotal)}</span>
            </div>
            <Button className="w-full" onClick={() => navigate('/checkout')}>
              Ir a pagar
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
