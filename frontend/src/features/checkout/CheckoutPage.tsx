import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { processOrder } from '@/api/checkout'
import { formatMoney } from '@/lib/currency'
import { getStatusCode, toUserMessage } from '@/lib/errors'
import { inventoryQueryKey } from '@/features/catalog/hooks'
import type { OrderOut } from '@/types/checkout'
import { useCart } from './CartContext'
import { findAffectedProductId } from './errorMapping'
import { OrderConfirmation } from './OrderConfirmation'

export function CheckoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { items, subtotal, clear } = useCart()

  const [confirmedOrder, setConfirmedOrder] = useState<OrderOut | null>(null)
  const [productNames, setProductNames] = useState<Record<number, string>>({})
  const [bannerMessage, setBannerMessage] = useState<string | null>(null)
  const [itemError, setItemError] = useState<{ productId: number; message: string } | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      processOrder({
        items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
      }),
    onSuccess: (order) => {
      setProductNames(Object.fromEntries(items.map(({ product }) => [product.id, product.name])))
      setConfirmedOrder(order)
      setBannerMessage(null)
      setItemError(null)
      clear()
      // Stock changed server-side — the catalog list must reflect it next visit.
      queryClient.invalidateQueries({ queryKey: inventoryQueryKey })
    },
    onError: (error) => {
      const status = getStatusCode(error)
      const message = toUserMessage(error, 'No pudimos confirmar tu pedido. Intenta de nuevo.')

      const affectedProductId =
        status === 400 || status === 404
          ? findAffectedProductId(
              message,
              items.map(({ product }) => ({ productId: product.id, name: product.name })),
            )
          : null

      if (affectedProductId !== null) {
        setBannerMessage('No pudimos confirmar tu pedido: revisa el producto marcado abajo.')
        setItemError({ productId: affectedProductId, message })
      } else {
        setBannerMessage(message)
        setItemError(null)
      }
    },
  })

  if (confirmedOrder) {
    return (
      <div className="flex min-h-screen flex-col bg-paper-100">
        <TopBar />
        <div className="flex flex-1 items-center justify-center p-10">
          <OrderConfirmation order={confirmedOrder} productNames={productNames} />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-paper-100">
        <TopBar />
        <div className="flex flex-1 items-center justify-center p-10">
          <EmptyState
            icon={
              <svg
                width={30}
                height={30}
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
            action={<Button onClick={() => navigate('/catalog')}>Ver catálogo</Button>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-100">
      <TopBar />
      <div className="flex flex-1 justify-center p-10">
        <div className="flex w-full max-w-[640px] flex-col gap-6">
          <div>
            <h1 className="font-display text-[30px] italic">Resumen de tu pedido</h1>
            <p className="text-[13px] text-ink-700">Revisa los productos antes de confirmar.</p>
          </div>

          {bannerMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-tint px-4 py-3.5"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="oklch(50% 0.15 30)"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0"
              >
                <path d="M12 3 2 21h20L12 3Z" />
                <path d="M12 9v5M12 17h.01" />
              </svg>
              <span className="text-[13px] leading-relaxed text-ink-950">{bannerMessage}</span>
            </div>
          )}

          <div className="overflow-hidden rounded-md border border-paper-200 bg-paper-50">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex flex-col border-b border-paper-200 px-5 py-4 last:border-b-0"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-[52px] w-[52px] shrink-0 rounded-sm bg-paper-200" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-ink-700">
                      Cantidad: {quantity} · {formatMoney(product.price)} c/u
                    </p>
                  </div>
                  <span className="text-[15px] font-bold">
                    {formatMoney(Number(product.price) * quantity)}
                  </span>
                </div>
                {itemError?.productId === product.id && (
                  <div className="ml-[62px] mt-3 flex items-center gap-2 rounded-sm bg-danger-tint px-3 py-2">
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="oklch(50% 0.15 30)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3 2 21h20L12 3Z" />
                      <path d="M12 9v5M12 17h.01" />
                    </svg>
                    <span className="text-[12.5px] font-medium text-danger">
                      {itemError.message}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-md border border-paper-200 bg-paper-50 p-5">
            <div className="flex justify-between">
              <span className="text-sm text-ink-700">Total</span>
              <span className="font-display text-2xl italic">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => navigate('/catalog')}>
                Volver al carrito
              </Button>
              <Button
                className="flex-1"
                isLoading={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                Confirmar pedido
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TopBar() {
  return (
    <div className="flex h-[72px] shrink-0 items-center gap-2.5 border-b border-paper-200 bg-paper-50 px-10">
      <Logo size={24} />
      <span className="font-display text-xl italic">Primsa</span>
    </div>
  )
}
