import axios from 'axios'

const GENERIC_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo.'

/**
 * Maps a caught error to a message safe to show a user. FastAPI's `detail`
 * is a plain string on 400/401/403/404 (curated by the backend, safe as-is),
 * but on 422 (Pydantic validation) it's an array of `{loc, msg, type}`
 * objects — never render that shape directly. Anything else (network error,
 * 5xx, no response) falls back to a generic message; we never surface raw
 * stack traces or internals.
 */
export function toUserMessage(error: unknown, fallback: string = GENERIC_MESSAGE): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail
    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail
    }
  }
  return fallback
}

export function getStatusCode(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}
