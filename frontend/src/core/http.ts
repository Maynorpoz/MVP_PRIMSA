import axios from 'axios'
import { config } from './config'

/**
 * Central Axios instance. This is the only module that knows how the JWT is
 * attached to requests and how a 401 is handled globally — no screen or
 * feature hook should read localStorage/sessionStorage directly or catch 401
 * itself. Token is provided via `setAuthToken`, called by AuthContext.
 */
export const httpClient = axios.create({
  baseURL: config.apiBaseUrl,
})

let currentToken: string | null = null

export function setAuthToken(token: string | null): void {
  currentToken = token
}

httpClient.interceptors.request.use((requestConfig) => {
  if (currentToken) {
    requestConfig.headers.Authorization = `Bearer ${currentToken}`
  }
  return requestConfig
})

// Registered by AuthContext on mount. There is no refresh-token endpoint in
// this backend (see INSTRUCCIONES.md section 4): a real 401 always means the
// session is no longer valid, so the only correct response is to clear it
// and send the user back to login — never a silent retry.
type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler
}

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)
