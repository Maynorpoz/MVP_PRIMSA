import { httpClient } from '@/core/http'
import type {
  AdminCreateRequest,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserOut,
} from '@/types/auth'

export function register(data: RegisterRequest): Promise<UserOut> {
  return httpClient.post<UserOut>('/access/register', data).then((res) => res.data)
}

export function authenticate(data: LoginRequest): Promise<TokenResponse> {
  return httpClient.post<TokenResponse>('/access/authenticate', data).then((res) => res.data)
}

export function createAdmin(data: AdminCreateRequest): Promise<UserOut> {
  return httpClient.post<UserOut>('/access/admins', data).then((res) => res.data)
}
