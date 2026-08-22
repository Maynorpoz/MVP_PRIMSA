import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import type { UserRole } from '@/types/auth'

export interface ProtectedRouteProps {
  allowedRoles: UserRole[]
}

/**
 * Gate for a route subtree. Per ARQUITECTURA.md section 7:
 *   1. no session -> /login (remembers where the user was headed)
 *   2. session but wrong role -> /unauthorized, never a raw 403
 *   3. a real 401 from any request already logs the user out globally
 *      (AuthContext's unauthorized handler) — this component just reacts to
 *      `isAuthenticated` becoming false, it never inspects `exp` itself.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
