import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { EmptyState } from '@/components/EmptyState'
import { useAuth } from '@/features/auth/AuthContext'
import { useCart } from '@/features/checkout/CartContext'
import { CartDrawer } from '@/features/checkout/CartDrawer'
import { useInventory } from './hooks'
import { ProductCard } from './ProductCard'

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-5">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="flex flex-col gap-3 rounded-md border border-paper-200 bg-paper-50 p-4"
        >
          <div className="h-[150px] animate-pulse rounded-sm bg-paper-200" />
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-paper-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-paper-200" />
        </div>
      ))}
    </div>
  )
}

export function InventoryPage() {
  const navigate = useNavigate()
  const { isAuthenticated, role, email, logout } = useAuth()
  const { addItem, itemCount } = useCart()
  const { data: products, isLoading, isError, refetch } = useInventory()

  const isCustomer = isAuthenticated && role === 'customer_role'

  return (
    <div className="flex min-h-screen flex-col bg-paper-100">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-paper-200 bg-paper-50 px-10">
        <div className="flex items-center gap-2.5">
          <Logo size={24} />
          <span className="font-display text-xl italic">Primsa</span>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-700">{email}</span>
            {role === 'sales_admin_role' && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="text-sm font-semibold text-brand-hover"
              >
                Panel admin
              </button>
            )}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-sm bg-ink-950">
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-ink-950">
                  {itemCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-ink-700 hover:text-ink-950"
            >
              Salir
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="h-10 rounded-sm border border-ink-950 px-4 text-sm font-semibold text-ink-950"
          >
            Iniciar sesión
          </button>
        )}
      </div>

      <div className="flex flex-1">
        <div className="flex-1 p-10">
          <div className="mb-6 flex items-baseline justify-between">
            <div>
              <h1 className="font-display text-3xl italic">Catálogo</h1>
              <p className="text-[13px] text-ink-700">
                {products ? `${products.length} productos disponibles` : ''}
              </p>
            </div>
          </div>

          {isLoading && <CatalogSkeleton />}

          {isError && (
            <EmptyState
              icon={
                <svg
                  width={30}
                  height={30}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3 2 21h20L12 3Z" />
                  <path d="M12 9v5M12 17h.01" />
                </svg>
              }
              title="No pudimos cargar el catálogo"
              description="Revisa tu conexión e intenta de nuevo."
              action={
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-sm font-semibold text-brand-hover"
                >
                  Reintentar
                </button>
              }
            />
          )}

          {products && products.length === 0 && (
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
                  <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
                  <path d="M3 8l9 5 9-5M12 13v8" />
                </svg>
              }
              title="No hay productos disponibles"
              description="Vuelve a revisar más tarde."
            />
          )}

          {products && products.length > 0 && (
            <div className="grid grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  canPurchase={isCustomer}
                  onAdd={(p) => addItem(p)}
                  onRequestLogin={() => navigate('/login')}
                />
              ))}
            </div>
          )}
        </div>

        <CartDrawer canCheckout={isCustomer} onRequestLogin={() => navigate('/login')} />
      </div>
    </div>
  )
}
