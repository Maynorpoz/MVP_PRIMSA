# Primsa MVP Backend

FastAPI + PostgreSQL backend implementing domain-oriented routing, JWT role-based
access control, and Prometheus/Grafana observability, per `INSTRUCCIONES.MD`.

## Run (from the project root, alongside `docker-compose.yml`)

```
docker compose up --build
```

* API: `http://localhost:8000` (docs at `/docs`, metrics at `/metrics`)
* Prometheus: `http://localhost:9090`
* Grafana: `http://localhost:3000` (login `admin` / `admin`) — the "Primsa Backend"
  dashboard is auto-provisioned with request rate, latency percentiles, error
  rate, and an up/down panel.

## Typical flow

1. `POST /access/register` — public self-registration; always creates a
   `customer_role` account (the role is never client-supplied, to prevent
   privilege escalation).
2. `POST /access/authenticate` — `{ "email": ..., "password": ... }` -> JWT.
3. Use the JWT as `Authorization: Bearer <token>` for protected routes.
4. `POST /access/admins` — creates a `sales_admin_role` account; requires a
   valid `sales_admin_role` JWT. To seed the very first admin, set
   `FIRST_ADMIN_EMAIL` / `FIRST_ADMIN_PASSWORD` (see `.env.example`) before
   first boot — the account is created once at startup if it doesn't exist.
5. `GET /catalog/inventory` — public, but the MVP ships with no seed products;
   insert rows into the `products` table (or add a seed script) to populate it.
6. `POST /checkout/process-order` — requires `customer_role`. Product rows are
   row-locked (`SELECT ... FOR UPDATE`) for the duration of the transaction so
   concurrent orders can't oversell the same stock.
7. `GET /management/daily-orders` — requires `sales_admin_role`, optional `?day=YYYY-MM-DD`.

## Local dev without Docker

```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
# point DATABASE_URL at a local Postgres instance (see .env.example)
uvicorn app.main:app --reload
```

Tables are created automatically on startup via `Base.metadata.create_all`
(no Alembic migrations in this MVP).
