import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authenticate } from '@/api/auth'
import { setAuthToken, setUnauthorizedHandler } from '@/core/http'
import { decodeAccessToken } from '@/lib/jwt'
import type { UserRole } from '@/types/auth'

// sessionStorage (not localStorage): survives a page refresh but not a
// closed tab, and is scoped to this origin — see INSTRUCCIONES.md section 8
// for the documented XSS trade-off of persisting a JWT in Web Storage at all.
const SESSION_STORAGE_KEY = 'primsa.session.token'

interface AuthState {
  token: string | null
  email: string | null
  role: UserRole | null
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean
  // Returns the resolved role so the caller (e.g. LoginPage, deciding where
  // to redirect) doesn't read `role` from its own stale render-time closure
  // — the state update from setState here hasn't been re-rendered yet.
  login: (email: string, password: string) => Promise<UserRole>
  logout: () => void
}

const EMPTY_STATE: AuthState = { token: null, email: null, role: null }

const AuthContext = createContext<AuthContextValue | null>(null)

function restoreSession(): AuthState {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (!token) return EMPTY_STATE

  // Decoded only to read claims for the UI (which nav/route to show) — never
  // to decide whether the session is still valid. There's no refresh
  // endpoint; validity is decided by the backend returning a real 401 on the
  // next request (section 7), not by checking `exp` locally here.
  const payload = decodeAccessToken(token)
  if (!payload) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return EMPTY_STATE
  }
  return { token, email: payload.sub, role: payload.role }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(restoreSession)

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    setState(EMPTY_STATE)
  }, [])

  useEffect(() => {
    setAuthToken(state.token)
  }, [state.token])

  // Registers with the central http client so a real 401 from ANY request
  // clears the session and (via ProtectedRoute) redirects to /login — no
  // screen has to implement this itself.
  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await authenticate({ email, password })
    const payload = decodeAccessToken(access_token)
    if (!payload) {
      throw new Error('El servidor devolvió una sesión inválida.')
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY, access_token)
    setState({ token: access_token, email: payload.sub, role: payload.role })
    return payload.role
  }, [])

  const value: AuthContextValue = {
    ...state,
    isAuthenticated: state.token !== null,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
