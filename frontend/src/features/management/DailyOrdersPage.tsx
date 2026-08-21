import { useState } from 'react'
import { Logo } from '@/components/Logo'
import { EmptyState } from '@/components/EmptyState'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/Table'
import { useAuth } from '@/features/auth/AuthContext'
import { formatMoney } from '@/lib/currency'
import { todayIsoDate } from '@/lib/date'
import { useDailyOrders } from './hooks'
import { CreateAdminForm } from './CreateAdminForm'

export function DailyOrdersPage() {
  const { email, logout } = useAuth()
  const [day, setDay] = useState(todayIsoDate())
  const { data: orders, isLoading, isError, refetch } = useDailyOrders(day)

  return (
    <div className="flex min-h-screen flex-col bg-paper-100">
      <div className="flex h-[72px] shrink-0 items-center justify-between bg-ink-950 px-10">
        <div className="flex items-center gap-2.5">
          <Logo inverted size={24} />
          <span className="font-display text-xl italic text-paper-50">Primsa</span>
          <span className="ml-1.5 rounded-full bg-brand-tint px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[oklch(40%_0.13_55)]">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[oklch(70%_0.01_60)]">{email}</span>
          <button
            type="button"
            onClick={logout}
            aria-label="Cerrar sesión"
            className="text-[oklch(70%_0.01_60)] hover:text-paper-50"
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden p-10">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-[28px] italic">Órdenes del día</h1>
              <p className="text-[13px] text-ink-700">
                {orders ? `${orders.length} pedidos registrados` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 items-center gap-2 rounded-sm border border-paper-200 bg-paper-50 px-3.5">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-ink-400"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
                <input
                  type="date"
                  value={day}
                  onChange={(event) => setDay(event.target.value)}
                  aria-label="Filtrar por fecha"
                  className="bg-transparent text-[13px] text-ink-950 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setDay(todayIsoDate())}
                className="h-10 rounded-sm border border-paper-200 bg-paper-50 px-4 text-[13px] font-semibold text-ink-950"
              >
                Hoy
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="animate-pulse rounded-md border border-paper-200 bg-paper-50 p-6">
              <div className="h-4 w-full rounded bg-paper-200" />
            </div>
          )}

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
              title="No pudimos cargar las órdenes"
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

          {orders && orders.length === 0 && (
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
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
              }
              title="No hay pedidos este día"
              description="Prueba seleccionando otra fecha en el filtro de arriba."
            />
          )}

          {orders && orders.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Orden</TableHeaderCell>
                  <TableHeaderCell>Productos</TableHeaderCell>
                  <TableHeaderCell>Hora</TableHeaderCell>
                  <TableHeaderCell className="text-right">Total</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-semibold">#{order.id}</TableCell>
                    <TableCell className="text-ink-700">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} artículos
                    </TableCell>
                    <TableCell className="text-ink-700">
                      {new Date(order.created_at).toLocaleTimeString('es-GT', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatMoney(order.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <CreateAdminForm />
      </div>
    </div>
  )
}
