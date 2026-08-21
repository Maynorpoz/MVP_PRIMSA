import { Button } from '@/components/Button'
import { formatMoney } from '@/lib/currency'
import type { ProductOut } from '@/types/catalog'

export interface ProductCardProps {
  product: ProductOut
  /** null when there is no session at all. */
  canPurchase: boolean
  onAdd: (product: ProductOut) => void
  onRequestLogin: () => void
}

function stockLabel(stock: number): { text: string; className: string } {
  if (stock <= 0) return { text: 'Agotado', className: 'text-ink-400' }
  if (stock <= 3) return { text: `Últimas ${stock} unidades`, className: 'text-brand-hover' }
  return { text: `${stock} disponibles`, className: 'text-success' }
}

export function ProductCard({ product, canPurchase, onAdd, onRequestLogin }: ProductCardProps) {
  const stock = stockLabel(product.stock)
  const outOfStock = product.stock <= 0

  return (
    <div
      className="flex flex-col overflow-hidden rounded-md border border-paper-200 bg-paper-50"
      style={outOfStock ? { opacity: 0.7 } : undefined}
    >
      <div className="flex h-[150px] items-center justify-center bg-paper-100">
        <svg
          width={40}
          height={40}
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(60% 0.02 60)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
          <path d="M3 8l9 5 9-5M12 13v8" />
        </svg>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-ink-950">{product.name}</h3>
          <span className="whitespace-nowrap text-[15px] font-bold text-ink-950">
            {formatMoney(product.price)}
          </span>
        </div>
        {product.description && (
          <p className="text-sm leading-relaxed text-ink-700">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2.5">
          <span className={`text-xs font-semibold ${stock.className}`}>{stock.text}</span>
          {canPurchase ? (
            <Button
              variant="secondary"
              disabled={outOfStock}
              onClick={() => onAdd(product)}
              className="h-[34px] px-3.5 text-[13px]"
            >
              Agregar
            </Button>
          ) : (
            <button
              type="button"
              onClick={onRequestLogin}
              className="text-xs font-semibold text-brand-hover"
            >
              Inicia sesión →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
