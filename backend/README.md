# Primsa MVP Backend

FastAPI + PostgreSQL backend implementing domain-oriented routing, JWT role-based
access control, and Prometheus metrics, per `INSTRUCCIONES.MD`.

## Run (from the project root, alongside `docker-compose.yml`)

```
docker compose up --build
```

API available at `http://localhost:8000`, docs at `http://localhost:8000/docs`,
metrics at `http://localhost:8000/metrics`.

## Typical flow

1. `POST /access/register` — create a user (`role` defaults to `customer_role`;
   pass `"sales_admin_role"` to create an admin).
2. `POST /access/authenticate` — `{ "email": ..., "password": ... }` -> JWT.
3. Use the JWT as `Authorization: Bearer <token>` for protected routes.
4. `GET /catalog/inventory` — public, but the MVP ships with no seed products;
   insert rows into the `products` table (or add a seed script) to populate it.
5. `POST /checkout/process-order` — requires `customer_role`.
6. `GET /management/daily-orders` — requires `sales_admin_role`, optional `?day=YYYY-MM-DD`.

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
