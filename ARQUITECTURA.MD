# Arquitectura del Backend: MVP Primsa

## 1. Contexto y Objetivos del Proyecto
Desarrollar el backend para un Producto Mínimo Viable (MVP) de la empresa "Primsa". El objetivo principal es automatizar las ventas mediante una plataforma web, mejorando la seguridad de los usuarios y proporcionando métricas de rendimiento del sistema (tiempos de respuesta y caídas).

## 2. Stack Tecnológico Requerido
*   **Framework:** Python con FastAPI.
*   **Base de Datos:** PostgreSQL.
*   **ORM:** SQLAlchemy (o SQLModel).
*   **Seguridad:** passlib (bcrypt) para encriptación, python-jose para JWT.
*   **Monitoreo:** prometheus-fastapi-instrumentator.

## 3. Arquitectura de Software (Capas)
Implementar una arquitectura modular estricta para separar responsabilidades. El proyecto debe contener los siguientes directorios:
*   `routers/`: Controladores HTTP. Solo reciben la petición, delegan al servicio y devuelven la respuesta.
*   `services/`: Lógica de negocio (cálculos de carritos, validación de reglas de negocio, generación de tokens).
*   `repositories/` (o `crud/`): Operaciones directas a la base de datos PostgreSQL utilizando el ORM.
*   `models/`: Definición de esquemas de base de datos y modelos Pydantic para validación de datos de entrada/salida.
*   `core/`: Configuraciones globales (variables de entorno, inicialización de base de datos, configuración de seguridad).

## 4. Requerimientos Funcionales y Enrutamiento (Endpoints)
No utilizar rutas genéricas (como /api/v1/ventas). Implementar la siguiente estructura de rutas orientada a dominio:

### Módulo de Control de Acceso (Auth)
*   **POST `/access/authenticate`**: Recibe credenciales. Verifica que la contraseña coincida con el hash (bcrypt) almacenado. Devuelve un JWT.
*   **Roles:** La base de datos debe soportar al menos los roles `customer_role` y `sales_admin_role`. El token JWT debe incluir el rol del usuario en su payload.

### Módulo de Catálogo y Transacciones
*   **GET `/catalog/inventory`**: Devuelve la lista de productos disponibles. Ruta pública o accesible para `customer_role`.
*   **POST `/checkout/process-order`**: Permite a un usuario autenticado (requiere `customer_role` validado vía JWT) enviar los IDs de los productos y crear una orden. Registra la orden en PostgreSQL asociándola al ID del usuario.
*   **GET `/management/daily-orders`**: Devuelve las órdenes realizadas. Ruta protegida, exclusiva para el rol `sales_admin_role`.

### Módulo de Observabilidad
*   **GET `/metrics`**: Exponer automáticamente las métricas de la aplicación (tiempos de respuesta HTTP, códigos de estado, cantidad de peticiones) para ser raspadas (scraped) por Prometheus.

## 5. Requerimientos de Infraestructura (Docker)
El proyecto operará bajo un ecosistema de contenedores.
*   **Dockerfile del Backend:** Crear un `Dockerfile` optimizado en la raíz del backend (usando una imagen base como `python:3.11-slim`), instalar dependencias vía `requirements.txt` y exponer el puerto correspondiente (ej. 8000) usando Uvicorn.
*   **Integración en Compose:** El backend debe estar diseñado para ser invocado desde un `docker-compose.yml` externo, dependiendo explícitamente de un servicio `postgres_db` (garantizando que la BD levante antes que la API).

## 6. Consideraciones de Implementación
*   Proporcionar el código completo de los archivos clave (`main.py`, modelos, dependencias de seguridad y rutas).
*   Manejar adecuadamente las excepciones HTTP (ej. 401 Unauthorized, 403 Forbidden, 404 Not Found) en la capa de servicios o routers.