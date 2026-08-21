# Primsa — Frontend

React + TypeScript + Vite frontend for the Primsa MVP. See
[`INSTRUCCIONES.md`](./INSTRUCCIONES.md) for the API contract, architecture,
and design system this project follows.

```bash
npm install
npm run dev        # dev server
npm run build      # production build
npm run lint        # eslint
npm run format       # prettier --write
npm test             # vitest
```

Runtime backend URL is read from `window.__ENV__` (see `src/core/config.ts`
and `infra/`), not from a Vite build-time env var — see INSTRUCCIONES.md
section 10.
