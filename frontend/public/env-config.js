// Local dev default. In production this exact file is regenerated at
// container start by infra/entrypoint.sh (envsubst over
// infra/env-config.template.js), so the built image is not tied to any one
// backend URL. Do not hardcode a different value here for prod — change
// API_BASE_URL in docker-compose.yml instead.
window.__ENV__ = {
  API_BASE_URL: 'http://localhost:8000',
}
