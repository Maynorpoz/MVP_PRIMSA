import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { LoginPage } from './LoginPage'
import * as authApi from '@/api/auth'

// The api/ layer is mocked here per ARQUITECTURA.md section 9 (phase 8):
// the real contract was already verified live with curl against the running
// backend (see section 4.1) — these tests cover the app's own logic
// (redirect-by-role, error display) against that verified shape.
vi.mock('@/api/auth')

function base64url(payload: object): string {
  const json = JSON.stringify(payload)
  const base64 = btoa(json)
  return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fakeJwt(payload: object): string {
  return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(payload)}.fakesignature`
}

function renderLoginFlow() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/catalog" element={<div>Catálogo — cliente</div>} />
          <Route path="/admin" element={<div>Panel admin</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('login flow (api mocked, contract verified live — section 4.1)', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('redirects a customer_role session to /catalog', async () => {
    vi.mocked(authApi.authenticate).mockResolvedValue({
      access_token: fakeJwt({ sub: 'ana@correo.com', role: 'customer_role', exp: 9999999999 }),
      token_type: 'bearer',
    })

    renderLoginFlow()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(screen.getByText('Catálogo — cliente')).toBeInTheDocument())
  })

  it('redirects a sales_admin_role session to /admin', async () => {
    vi.mocked(authApi.authenticate).mockResolvedValue({
      access_token: fakeJwt({ sub: 'admin@primsa.com', role: 'sales_admin_role', exp: 9999999999 }),
      token_type: 'bearer',
    })

    renderLoginFlow()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@primsa.com')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(screen.getByText('Panel admin')).toBeInTheDocument())
  })

  it('shows the backend detail message on a 401 instead of a generic error', async () => {
    const axiosError = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { status: 401, data: { detail: 'Incorrect email or password' } },
    })
    vi.mocked(authApi.authenticate).mockRejectedValue(axiosError)

    renderLoginFlow()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(screen.getByText('Incorrect email or password')).toBeInTheDocument())
  })
})
