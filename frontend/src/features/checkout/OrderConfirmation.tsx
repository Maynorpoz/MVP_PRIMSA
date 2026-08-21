import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { formatMoney } from '@/lib/currency'
import { formatDateTime } from '@/lib/date'
import type { OrderOut } from '@/types/checkout'

export interface OrderConfirmationProps {
  order: OrderOut
  /** product_id -> name, captured from the cart before it was cleared —
   * OrderOut itself doesn't carry product names (see types/checkout.ts). */
  productNames?: Record<number, string>
}

export function OrderConfirmation({ order, productNames = {} }: OrderConfirmationProps) {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-5 rounded-md border border-paper-200 bg-paper-50 px-10 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-tint">
        <svg
          width={30}
          height={30}
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(52% 0.09 175)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      </div>
      <div>
        <h1 className="font-display text-[28px] italic">¡Pedido confirmado!</h1>
        <p className="text-sm text-ink-700">
          Orden <strong className="text-ink-950">#{order.id}</strong> ·{' '}
          {formatDateTime(order.created_at)}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2.5 rounded-sm bg-paper-100 px-5 py-4 text-left">
        {order.items.map((item) => (
          <div key={item.product_id} className="flex justify-between text-[13px]">
            <span className="text-ink-700">
              {productNames[item.product_id] ?? `Producto #${item.product_id}`} × {item.quantity}
            </span>
            <span className="font-semibold">
              {formatMoney(Number(item.unit_price) * item.quantity)}
            </span>
          </div>
        ))}
        <div className="my-1 h-px bg-paper-200" />
        <div className="flex justify-between text-sm font-bold">
          <span>Total</span>
          <span>{formatMoney(order.total)}</span>
        </div>
      </div>

      <Button className="w-full" onClick={() => navigate('/catalog')}>
        Volver al catálogo
      </Button>
    </div>
  )
}
