import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '@/types/auth'

/**
 * Decodes (never verifies) the access token to read `role`/`sub`. Signature
 * validation is the backend's job on every request — the client only needs
 * the claims to drive UI (which nav to show, which route guard to apply).
 * Session validity itself is decided by the backend via a real 401, not by
 * reading `exp` here (see ARQUITECTURA.md section 7).
 */
export function decodeAccessToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token)
  } catch {
    return null
  }
}
