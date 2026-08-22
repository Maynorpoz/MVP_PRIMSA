# Arquitectura Técnica: Frontend MVP Primsa

## 1. Contexto y Objetivos del Proyecto

Construir el frontend del MVP de "Primsa" que consume el backend ya implementado
(`../backend`, FastAPI + PostgreSQL, ver `../INSTRUCCIONES.MD`). El objetivo es
ofrecer una experiencia web para dos roles de usuario — `customer_role` y
`sales_admin_role` — que cubra el flujo completo de venta: autenticación,
navegación de catálogo, checkout y panel de administración de órdenes.

Este documento define el contrato con el backend, la arquitectura, el proceso
de diseño visual y las fases de desarrollo. Aplica los mismos estándares de
calidad usados en el backend: arquitectura en capas, patrones de diseño,
código limpio y seguridad de software.

## 2. Stack Tecnológico Requerido

- **Framework:** React 18 + TypeScript, con Vite como bundler/dev server.
- **Enrutamiento:** React Router (rutas protegidas por rol).
- **Estado de servidor / data fetching:** TanStack Query (React Query) — cache,
  reintentos, invalidación tras mutaciones (ej. invalidar inventario tras un
  checkout).
- **Cliente HTTP:** Axios, con una instancia central e interceptores para
  adjuntar el JWT y manejar 401/403 de forma uniforme.
- **Validación de formularios:** React Hook Form + Zod (los esquemas Zod deben
  reflejar los modelos Pydantic del backend, ver sección 4).
- **Estilos:** Tailwind CSS, con tokens de diseño (color, tipografía,
  espaciado) definidos a partir del sistema visual que se genere en la Fase 1
  (sección 5) — no clases utilitarias improvisadas sin sistema.
- **Estado de autenticación:** Context API de React (no Redux; el estado de
  auth es simple: token + rol + email).
- **Testing:** Vitest + React Testing Library.

No introducir librerías adicionales de gestión de estado global (Redux,
Zustand, etc.) — el alcance del MVP no lo justifica.

## 3. Arquitectura de Software (Capas)

Arquitectura modular por _feature_, no por tipo de archivo suelto. Estructura
mínima dentro de `src/`:

```
src/
  api/              # Cliente HTTP central + funciones por dominio (auth.ts,
                     # catalog.ts, checkout.ts, management.ts). Es la única
                     # capa que conoce URLs y forma de las peticiones HTTP.
  types/             # Tipos TypeScript espejo de los esquemas Pydantic
                     # (contrato de la sección 4). Fuente única de verdad de
                     # las formas de datos del backend.
  features/
    auth/            # LoginPage, RegisterPage, useAuth(), AuthContext,
                     # ProtectedRoute, esquemas Zod de login/registro.
    catalog/         # InventoryPage, ProductCard, hooks de catálogo.
    checkout/        # CartContext/hook, CheckoutPage, OrderConfirmation.
    management/      # DailyOrdersPage, filtros por fecha, CreateAdminForm.
  components/        # Componentes de UI reutilizables y sin lógica de
                     # negocio (Button, Input, Card, Table, Toast, Spinner...).
  routes/            # Definición del árbol de rutas y guards por rol.
  lib/               # Utilidades puras (formateo de moneda/fecha, decode JWT).
  core/              # Configuración global (env, cliente Axios, QueryClient).
```

Reglas de capa (equivalentes a las del backend):

- `components/` no importa nada de `features/` ni conoce el dominio Primsa.
- `features/*` no llama a Axios directamente: siempre a través de `api/`.
- `api/*` no conoce React (ni hooks, ni componentes): solo I/O HTTP y tipos.
- La lógica de negocio de UI (cálculo de subtotal del carrito, validación de
  stock antes de enviar, etc.) vive en hooks dentro de `features/`, no en los
  componentes de presentación ni en `api/`.

## 4. Contrato de API (fuente de verdad: código actual del backend)

Base URL configurable en runtime (ver sección 8) — nunca hardcodear
`http://localhost:8000` en el código.

| Método | Ruta                                      | Auth requerida                 | Body                                    | Respuesta éxito                                                                                 |
| ------ | ----------------------------------------- | ------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| POST   | `/access/register`                        | Pública                        | `{ email, password }`                   | 201 `{ id, email, role: "customer_role", created_at }`                                          |
| POST   | `/access/authenticate`                    | Pública                        | `{ email, password }`                   | 200 `{ access_token, token_type: "bearer" }`                                                    |
| POST   | `/access/admins`                          | Bearer, rol `sales_admin_role` | `{ email, password }`                   | 201 `{ id, email, role: "sales_admin_role", created_at }`                                       |
| GET    | `/catalog/inventory`                      | Pública                        | —                                       | 200 `[{ id, name, description, price, stock }]`                                                 |
| POST   | `/checkout/process-order`                 | Bearer, rol `customer_role`    | `{ items: [{ product_id, quantity }] }` | 201 `{ id, user_id, status, total, created_at, items: [{ product_id, quantity, unit_price }] }` |
| GET    | `/management/daily-orders?day=YYYY-MM-DD` | Bearer, rol `sales_admin_role` | — (query opcional `day`)                | 200 `[OrderOut...]`                                                                             |
| GET    | `/metrics`                                | —                              | —                                       | Formato Prometheus; **no se consume desde el frontend**, es solo para scraping.                 |

Notas importantes que el frontend debe manejar explícitamente:

- **El registro nunca acepta `role` del cliente** (es una medida de seguridad
  del backend: previene auto-asignación de `sales_admin_role`). No agregar un
  selector de rol en el formulario de registro público.
- **El rol del usuario no viene en la respuesta de `/access/authenticate`**:
  solo se obtiene decodificando el JWT (`payload.role`, `payload.sub`). Usa una
  librería ligera de decode (ej. `jwt-decode`) — nunca reimplementes el parseo
  de JWT a mano, y nunca valides la firma en el cliente (no es su
  responsabilidad; el backend ya la valida en cada request).
- **No existe endpoint de refresh token.** El access token expira en 60
  minutos (configurable en el backend). Al recibir un 401 en cualquier
  petición autenticada, el frontend debe limpiar la sesión y redirigir a
  login — no intentar refrescar silenciosamente.
- **Errores 403** (rol incorrecto) deben mostrarse como "no autorizado para
  esta acción", nunca como error genérico ni como 401.
- **Errores 400 de checkout** (stock insuficiente, cantidad inválida, producto
  no encontrado) deben mostrarse en el contexto del carrito, no como un toast
  genérico — el usuario necesita saber _qué producto_ falló para corregir su
  orden.
- Los tipos en `types/` deben ser el espejo exacto de esta tabla. Si el
  backend cambia un esquema, este documento y `types/` se actualizan juntos.

### 4.1 Hallazgos verificados contra el backend real (2026-08-21)

Verificado con `curl` contra el backend levantado localmente (`docker compose
up postgres_db backend`). Tres detalles que el MD original no capturaba:

- **`price`, `unit_price` y `total` viajan como strings JSON**, no como
  números (FastAPI serializa `Decimal` como string, ej. `"29.99"`). Los tipos
  en `types/` deben tiparlos `string`, y toda operación aritmética (subtotal,
  total del carrito) debe pasar por `Number(...)` o una utilidad de
  parseo/formateo centralizada en `lib/` — nunca asumir que ya son `number`.
- **Producto no encontrado en checkout responde 404, no 400** (`{"detail":
"Products not found: [999]"}`), a diferencia de stock insuficiente y
  cantidad inválida que sí son 400. El manejo de errores de checkout debe
  distinguir status, no asumir que todo error de carrito es 400.
- **CORS no estaba configurado en el backend** (sin `CORSMiddleware`, toda
  petición cross-origin del navegador habría fallado sin importar el JWT).
  Se agregó `CORSMiddleware` en `backend/app/main.py` con origen(es)
  permitidos configurables vía `CORS_ORIGINS` (nueva env var, default
  `http://localhost:5173`), reflejado en `docker-compose.yml` y
  `backend/.env.example`. Si se cambia el puerto/origen del frontend, esta
  variable debe actualizarse junto con él.
- **El `detail` de un error no siempre es un string.** En 400/401/403/404 sí
  lo es (mensajes controlados, seguros de mostrar tal cual). En 422 (error de
  validación Pydantic) es un **array** de objetos `{type, loc, msg, ...}`. La
  validación Zod del lado cliente debería prevenir la mayoría de 422 antes de
  enviar, pero `lib/errors.ts` debe manejar ambas formas sin romper (nunca
  renderizar `[object Object]`) y caer a un mensaje genérico si `detail` no es
  un string plano.

## 5. Diseño de UI — uso obligatorio de la skill `design`

Antes de escribir el código de cualquier pantalla nueva (Fase 1 y cada vez que
se agregue una vista no contemplada aún), **invoca la skill `design` de Claude**
para generar el mockup/canvas de esa pantalla. Esto es un requisito de
proceso, no opcional.

Objetivo explícito: evitar el "look genérico de IA" — paletas moradas o
azul-violeta por defecto, tarjetas con `shadow-md` y esquinas redondeadas
idénticas en todo, layouts de plantilla de admin dashboard genérico, iconografía
de stock sin criterio. Primsa necesita una identidad visual propia y coherente:

- Define un sistema de diseño real antes de maquetar: paleta de marca (no la
  paleta por defecto de ningún framework), escala tipográfica, escala de
  espaciado, radios y sombras consistentes. Estos tokens se trasladan
  literalmente a `tailwind.config` — no se improvisan clase por clase.
- Diseña las pantallas clave con la skill `design` antes de implementarlas:
  login/registro, catálogo (grid de productos + carrito), checkout/resumen de
  orden, y el panel de administración (tabla de órdenes del día + filtro de
  fecha). Itera el mockup hasta que se sienta como un producto con marca,
  no como una plantilla.
- La implementación en React/Tailwind debe ser fiel al mockup aprobado, no una
  interpretación libre — el mockup es la especificación visual.
- Aplica esto también a estados secundarios que suelen quedar genéricos:
  vacíos (carrito vacío, sin órdenes hoy), de error, y de carga — no dejarlos
  como texto plano por defecto del framework.

## 6. Requerimientos Funcionales por Módulo

### Módulo de Acceso (Auth)

- Página de login (email + password) → `POST /access/authenticate`. Al
  autenticar, decodifica el JWT, guarda `{ token, email, role }` en el
  `AuthContext`, y redirige según rol: `customer_role` → catálogo,
  `sales_admin_role` → panel de administración.
- Página de registro (email + password, con confirmación de password y
  validación Zod de formato/fortaleza mínima) → `POST /access/register`.
  Tras registrar, redirige a login (el backend no autentica automáticamente).
- Cierre de sesión: limpia el contexto y cualquier persistencia del token.

### Módulo de Catálogo

- Vista de inventario (`GET /catalog/inventory`) accesible sin autenticación,
  pero con affordance para agregar al carrito solo si el usuario tiene sesión
  con `customer_role` (si no, invita a iniciar sesión).
- Estado de carrito (cantidad por producto) en cliente, validando contra el
  `stock` recibido del backend antes de permitir incrementar cantidad — esto
  es UX preventiva, no reemplaza la validación real que hace el backend en
  `POST /checkout/process-order`.

### Módulo de Checkout

- Resumen de carrito → `POST /checkout/process-order` con
  `{ items: [{ product_id, quantity }] }`.
- Tras éxito (201), mostrar confirmación con el `OrderOut` recibido (número de
  orden, total, items) y vaciar el carrito.
- Tras error 400 (stock insuficiente / producto no encontrado / cantidad
  inválida), mantener el carrito y señalar el ítem específico afectado.
- Ruta protegida: solo accesible con sesión de `customer_role`.

### Módulo de Administración

- Tabla de órdenes del día (`GET /management/daily-orders`) con selector de
  fecha opcional (`?day=YYYY-MM-DD`, por defecto hoy).
- Formulario para crear nuevos administradores (`POST /access/admins`),
  visible solo para usuarios con `sales_admin_role` ya autenticados.
- Ruta protegida: solo accesible con sesión de `sales_admin_role`; un
  `customer_role` que intente acceder por URL directa debe ser redirigido, no
  ver un 403 crudo del backend.

## 7. Autenticación, Roles y Rutas Protegidas

- `ProtectedRoute` (o equivalente) recibe los roles permitidos y:
  1. Si no hay token → redirige a `/login`.
  2. Si hay token pero el rol no coincide → redirige a una pantalla de "no
     autorizado" o a la home correspondiente a su rol real (no a un error
     técnico).
  3. Si el token expiró (detectado por un 401 real del backend, no por
     lectura local de `exp` — el backend es la fuente de verdad) → limpia
     sesión y redirige a `/login`.
- El interceptor de Axios centraliza el manejo de 401 (logout + redirect) para
  que ninguna pantalla tenga que implementarlo por separado.

## 8. Seguridad de Frontend

- El JWT se guarda en memoria (`AuthContext`) como fuente primaria; si se
  persiste para sobrevivir un refresh de página, usar `sessionStorage` (no
  `localStorage`) y documentar el trade-off: cualquier persistencia en Web
  Storage es legible por JS de terceros si hay una vulnerabilidad XSS, por lo
  que toda entrada de usuario debe renderizarse escapada (React ya lo hace por
  defecto: no usar `dangerouslySetInnerHTML` en ningún punto de este MVP).
- Nunca loguear el JWT completo en consola ni en herramientas de analítica.
- Todas las mutaciones (registro, login, checkout, creación de admins) validan
  con Zod en el cliente antes de enviar — esto es UX, no seguridad: el backend
  vuelve a validar y es la autoridad real.
- Mensajes de error mostrados al usuario nunca deben incluir detalles internos
  crudos de la respuesta del backend (stack traces, SQL, etc.) — mapear los
  `detail` de FastAPI a mensajes de usuario controlados.
- `API_BASE_URL` (sección 9) nunca debe apuntar a un dominio distinto del
  backend propio sin CORS explícitamente configurado ahí — no se debe asumir
  wildcard CORS en producción.

## 9. Fases de Desarrollo

Seguir este orden; cada fase debe quedar funcional antes de avanzar a la
siguiente (no dejar implementaciones a medias).

1. **Setup y tooling**: scaffold Vite + React + TS, ESLint + Prettier,
   Tailwind, estructura de carpetas de la sección 3, cliente Axios base,
   `.env.example` con `VITE_API_URL` (o el mecanismo de runtime config de la
   sección 10 si ya se implementa desde aquí).
2. **Sistema de diseño y UI Kit**: ejecutar la skill `design` (sección 5) para
   definir tokens de marca y los componentes base de `components/` (Button,
   Input, Card, Table, Toast, Spinner, EmptyState). Ningún componente de
   dominio se construye antes de que exista este kit.
3. **Autenticación**: `AuthContext`, login, registro, interceptor de Axios,
   `ProtectedRoute`. Verificar manualmente los tres flujos de rol (sin sesión,
   `customer_role`, `sales_admin_role`) contra el backend real.
4. **Catálogo**: inventario + carrito en cliente.
5. **Checkout**: envío de orden, confirmación, manejo de errores 400
   específicos por producto.
6. **Administración**: tabla de órdenes del día + filtro de fecha, formulario
   de creación de admins.
7. **Estados y accesibilidad**: loading, vacío, error en cada pantalla
   (diseñados en la Fase 2, no improvisados aquí); revisar contraste de color,
   foco de teclado, labels de formulario.
8. **Testing**: unitarios de hooks/lógica de carrito y validaciones Zod;
   integración de los flujos de login → catálogo → checkout y de
   login-admin → daily-orders, con la capa `api/` mockeada.
9. **Contenerización**: `Dockerfile` (build multi-stage) e integración en
   `docker-compose.yml` — ver sección 10.
10. **QA y hardening final**: repasar la sección 8 completa contra la
    implementación real antes de dar el MVP por terminado.

## 10. Infraestructura Docker

- **Dockerfile multi-stage** en la raíz de `frontend/`:
  - Etapa `build`: imagen `node:20-alpine`, `npm ci`, `npm run build` (genera
    estáticos de Vite en `dist/`).
  - Etapa final: imagen `nginx:alpine`, copia `dist/` a
    `/usr/share/nginx/html`, expone el puerto 80.
- **Config runtime, no build-time, para la URL del backend**: las variables
  `VITE_*` de Vite se inyectan en tiempo de build y quedan fijas en el bundle,
  lo cual rompe el principio de "una imagen, cualquier entorno". En su lugar:
  - Genera en runtime un archivo `env-config.js` (vía `entrypoint.sh` con
    `envsubst` sobre una plantilla, ejecutado al arrancar el contenedor nginx)
    que exponga `window.__ENV__ = { API_BASE_URL: "..." }`, leído por
    `core/config.ts` en vez de `import.meta.env` directamente.
  - `docker-compose.yml` (raíz del proyecto, ya actualizado) define el
    servicio `frontend` con `API_BASE_URL: http://localhost:8000` — ese valor
    debe apuntar a una URL alcanzable desde el **navegador del usuario**, no
    desde la red interna de Docker (por eso es `localhost:8000` y no
    `backend:8000`).
- El servicio `frontend` en `docker-compose.yml` ya está declarado
  (`build.context: ./frontend`, puerto host `5173` → contenedor `80`,
  `depends_on: backend`). No requiere cambios de infraestructura adicionales
  salvo que el puerto interno de nginx cambie.

## 11. Notas Adicionales de Implementación

- Antes de escribir código, confirma que el backend está corriendo
  (`docker compose up`) y prueba el contrato de la sección 4 con `curl` o el
  cliente HTTP del IDE — no asumas la forma de la respuesta sin verificarla.
- Aplicar los mismos criterios de código limpio que en el backend: sin
  abstracciones prematuras, sin componentes/hooks especulativos para
  requerimientos hipotéticos, comentarios solo donde el "por qué" no sea obvio.
- Cualquier decisión que se aparte de este documento (nueva librería, cambio
  de estructura de carpetas, endpoint no listado en la sección 4) debe
  reflejarse actualizando este mismo archivo.
