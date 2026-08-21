/**
 * Mirrors backend/app/models/schemas.py (Auth section) and
 * backend/app/models/db_models.py::UserRoleEnum. Source of truth: see
 * INSTRUCCIONES.md section 4.
 */

export type UserRole = 'customer_role' | 'sales_admin_role'

export interface RegisterRequest {
  email: string
  password: string
}

// POST /access/register never accepts a `role` field — the backend ignores
// it by design to prevent client-side privilege escalation. Do not add one
// here even if a future screen "just needs it".
export interface UserOut {
  id: number
  email: string
  role: UserRole
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: 'bearer'
}

// The JWT payload shape (decoded client-side, never verified client-side —
// the backend is the authority). `sub` is the user's email.
export interface JwtPayload {
  sub: string
  role: UserRole
  exp: number
}

export interface AdminCreateRequest {
  email: string
  password: string
}
