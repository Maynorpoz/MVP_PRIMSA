import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

const SESSION_KEY = 'primsa.session.token'

function base64url(payload: object): string {
  return btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fakeJwt(role: string): string {
  return `${base64url({ alg: 'HS256' })}.${base64url({ sub: 'user@correo.com', role, exp: 9999999999 })}.sig`
}

function renderGuarded(allowedRoles: Array<'customer_role' | 'sales_admin_role'>) {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route path="/admin" element={<div>Contenido protegido</div>} />
          </Route>
          <Route path="/login" element={<div>Página de login</div>} />
          <Route path="/unauthorized" element={<div>No autorizado</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('redirects to /login when there is no session', () => {
    renderGuarded(['sales_admin_role'])
    expect(screen.getByText('Página de login')).toBeInTheDocument()
  })

  it('redirects to /unauthorized when the role does not match', () => {
    sessionStorage.setItem(SESSION_KEY, fakeJwt('customer_role'))
    renderGuarded(['sales_admin_role'])
    expect(screen.getByText('No autorizado')).toBeInTheDocument()
  })

  it('renders the protected content when the role matches', () => {
    sessionStorage.setItem(SESSION_KEY, fakeJwt('sales_admin_role'))
    renderGuarded(['sales_admin_role'])
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })
})
