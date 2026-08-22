#!/bin/sh
# Runs automatically at container start via nginx's own
# /docker-entrypoint.d/ mechanism (official nginx image, no custom
# ENTRYPOINT needed). Regenerates env-config.js from the real environment
# so the same built image works unmodified across environments — see
# ARQUITECTURA.md section 10 and src/core/config.ts.
set -eu

: "${API_BASE_URL:?API_BASE_URL must be set}"

envsubst '${API_BASE_URL}' \
  < /usr/share/nginx/html/env-config.template.js \
  > /usr/share/nginx/html/env-config.js
