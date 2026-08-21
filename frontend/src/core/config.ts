/**
 * Runtime (not build-time) configuration.
 *
 * Vite bakes `import.meta.env.VITE_*` into the bundle at build time, which
 * breaks "build once, deploy anywhere": a Docker image built with one
 * backend URL could never be reused against another. Instead we read
 * `window.__ENV__`, populated by `/env-config.js` — a plain script tag
 * loaded before the app (see index.html) that in production is regenerated
 * at container startup from the real environment (see infra/entrypoint.sh),
 * and in local dev falls back to the static default in public/env-config.js.
 */
export {}

declare global {
  interface Window {
    __ENV__?: {
      API_BASE_URL?: string
    }
  }
}

const FALLBACK_API_BASE_URL = 'http://localhost:8000'

function readApiBaseUrl(): string {
  const fromRuntime = typeof window !== 'undefined' ? window.__ENV__?.API_BASE_URL : undefined
  if (fromRuntime && fromRuntime.trim().length > 0) {
    return fromRuntime.trim()
  }
  return FALLBACK_API_BASE_URL
}

export const config = {
  apiBaseUrl: readApiBaseUrl(),
}
