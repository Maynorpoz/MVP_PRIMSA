# Primsa MVP

MVP de venta en línea para "Primsa": catálogo, checkout y panel de
administración de órdenes, con autenticación por rol y observabilidad
integrada. Ver `INSTRUCCIONES.MD` (backend) y `frontend/INSTRUCCIONES.md`
(frontend) para el detalle completo de arquitectura, contrato de API y fases
de desarrollo — este README es solo la puerta de entrada rápida al proyecto.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Python + FastAPI, SQLAlchemy, PostgreSQL, JWT (python-jose), bcrypt (passlib) |
| Frontend | React + TypeScript + Vite, TanStack Query, Axios, React Hook Form + Zod, Tailwind CSS |
| Observabilidad | Prometheus + Grafana |
| Infraestructura | Docker Compose (todos los servicios) |

## Estructura del repositorio

```
backend/       API FastAPI (routers/services/repositories/models/core)
frontend/      SPA React (api/types/features/components/routes/lib/core)
monitoring/    Configuración de Prometheus y dashboards de Grafana
docker-compose.yml
```

## Levantar todo el entorno

Requiere Docker y Docker Compose.

```bash
docker compose up --build
```

Esto levanta, en orden de dependencias: `postgres_db` → `backend` →
`frontend`, más `prometheus` y `grafana`.

| Servicio | URL | Notas |
|---|---|---|
| Frontend | http://localhost:5173 | SPA (nginx sirviendo el build de Vite) |
| Backend API | http://localhost:8000 | Docs interactivas en `/docs`, métricas en `/metrics` |
| PostgreSQL | localhost:5432 | usuario/clave/base: `primsa` / `primsa` / `primsa` |
| Prometheus | http://localhost:9090 | scrapea al backend |
| Grafana | http://localhost:3000 | login `admin` / `admin` — dashboard "Primsa Backend" auto-provisionado |

Para detener y liberar los contenedores: `docker compose down` (agregar `-v`
si además quieres borrar los volúmenes de datos).

## Roles y acceso

Hay dos roles: `customer_role` (compra en el catálogo) y
`sales_admin_role` (revisa órdenes del día y crea otros administradores).

* **Registro público** (`POST /access/register` o el formulario de
  "Crear cuenta" del frontend) crea únicamente cuentas `customer_role` — el
  rol nunca es asignable desde el cliente, por diseño de seguridad.
* **No hay un endpoint para crear el primer administrador desde la API**
  (`POST /access/admins` ya requiere una sesión `sales_admin_role` para
  funcionar). Para sembrar el primer admin, define estas variables en el
  servicio `backend` de `docker-compose.yml` **antes** del primer arranque
  (se crean una sola vez, se ignoran si el correo ya existe):

  ```yaml
  FIRST_ADMIN_EMAIL: admin@primsa.com
  FIRST_ADMIN_PASSWORD: cambia-esta-clave
  ```

  Con esa cuenta ya puedes crear el resto de administradores desde el panel
  (`/admin` → "Crear administrador"), sin volver a tocar variables de entorno.

## Datos de catálogo

El MVP no trae productos de ejemplo. Para probar el catálogo/checkout,
inserta filas directamente en la tabla `products` de Postgres, por ejemplo:

```bash
docker compose exec postgres_db psql -U primsa -d primsa -c \
  "INSERT INTO products (name, description, price, stock, created_at) VALUES
   ('Camisa Primsa Classic', 'Camisa de algodón corte clásico', 29.99, 50, now());"
```

## Seguridad — pendientes conocidos

* `backend/.env.example` trae una contraseña real de ejemplo en vez de un
  placeholder, y no está en `.gitignore`. Debe revertirse/rotarse antes de
  cualquier despliegue compartido.
* `SECRET_KEY` y las credenciales de Postgres/Grafana en `docker-compose.yml`
  son valores de desarrollo — deben sobreescribirse por variables de entorno
  reales en producción, nunca quedar hardcodeadas en el repositorio.

## Desarrollo por servicio

* Backend: ver `backend/README.md` (correr sin Docker, flujo típico de
  endpoints, notas de concurrencia en checkout).
* Frontend: ver `frontend/README.md` y `frontend/INSTRUCCIONES.md` (scripts
  de `npm`, sistema de diseño, contrato de API verificado contra el backend
  real, config runtime vía `window.__ENV__`).
