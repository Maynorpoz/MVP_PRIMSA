# ---- build: compile the static assets ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime: serve with nginx, inject config at container start ----
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY infra/env-config.template.js /usr/share/nginx/html/env-config.template.js

# Picked up automatically by nginx's own /docker-entrypoint.d/ startup
# mechanism — no custom ENTRYPOINT/CMD needed (see infra/40-env-config.sh).
COPY infra/40-env-config.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh

EXPOSE 80
