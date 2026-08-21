import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ToastProvider } from '@/components/ToastProvider'
import * as managementApi from '@/api/management'
import { DailyOrdersPage } from './DailyOrdersPage'
import type { OrderOut } from '@/types/checkout'

vi.mock('@/api/management')

const SESSION_KEY = 'primsa.session.token'

function base64url(payload: object): string {
  return btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fakeAdminJwt(): string {
  return `${base64url({ alg: 'HS256' })}.${base64url({ sub: 'admin@primsa.com', role: 'sales_admin_role', exp: 9999999999 })}.sig`
}

const sampleOrder: OrderOut = {
  id: 1042,
  user_id: 7,
  status: 'created',
  total: '105.48',
  created_at: '2026-08-21T10:42:00',
  items: [
    { product_id: 1, quantity: 2, unit_price: '29.99' },
    { product_id: 2, quantity: 1, unit_price: '45.50' },
  ],
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <DailyOrdersPage />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('login-admin -> daily orders (api mocked, contract verified live — section 4.1)', () => {
  beforeEach(() => {
    sessionStorage.setItem(SESSION_KEY, fakeAdminJwt())
    vi.clearAllMocks()
  })

  it('renders the orders for the selected day', async () => {
    vi.mocked(managementApi.getDailyOrders).mockResolvedValue([sampleOrder])

    renderPage()

    await waitFor(() => expect(screen.getByText('#1042')).toBeInTheDocument())
    expect(screen.getByText('3 artículos')).toBeInTheDocument()
    expect(screen.getByText('admin@primsa.com')).toBeInTheDocument()
  })

  it('shows the empty state when there are no orders that day', async () => {
    vi.mocked(managementApi.getDailyOrders).mockResolvedValue([])

    renderPage()

    await waitFor(() => expect(screen.getByText('No hay pedidos este día')).toBeInTheDocument())
  })

  it('shows the create-admin form alongside the table', async () => {
    vi.mocked(managementApi.getDailyOrders).mockResolvedValue([])
    renderPage()
    expect(screen.getByRole('heading', { name: 'Crear administrador' })).toBeInTheDocument()
  })
})
