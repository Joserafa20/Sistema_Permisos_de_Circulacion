# Manual Técnico — Sistema de Permisos de Circulación (Pico y Placa)

**Versión:** 1.0  
**Fecha:** 2026-08-02  
**Audiencia:** Desarrolladores, equipo de TI, administradores del sistema

---

## 1. Arquitectura

### 1.1 Visión General

El sistema sigue la **Arquitectura Hexagonal** (Ports & Adapters), también conocida como Arquitectura de Puertos y Adaptadores. Esta arquitectura separa el núcleo del dominio de los adaptadores de infraestructura, haciendo que el negocio sea independiente del framework, la base de datos y los servicios externos.

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADAPTADORES PRIMARIOS                    │
│   HTTP Controllers (NestJS) | CLI Workers | Cron Jobs           │
├─────────────────────────────────────────────────────────────────┤
│                        PUERTOS PRIMARIOS (Driving)              │
│  ICrearSolicitudUseCase | IAprobarSolicitudUseCase | ILoginUseCase  │
├─────────────────────────────────────────────────────────────────┤
│                        NÚCLEO DEL DOMINIO                       │
│   Entidades de Dominio | Reglas de Negocio | Value Objects      │
├─────────────────────────────────────────────────────────────────┤
│                        PUERTOS SECUNDARIOS (Driven)             │
│  ISolicitudRepository | IStoragePort | IEmailPort | IQueuePort  │
├─────────────────────────────────────────────────────────────────┤
│                        ADAPTADORES SECUNDARIOS                  │
│  TypeORM | MinIO | Nodemailer | BullMQ | Redis | reCAPTCHA     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Capas del Backend

| Capa | Directorio | Descripción |
|------|-----------|-------------|
| **Domain** | `src/domain/` | Entidades, value objects, interfaces de repositorio |
| **Application** | `src/application/` | Use cases, DTOs de aplicación, interfaces de puertos |
| **Infrastructure** | `src/infrastructure/` | Controladores, repositorios TypeORM, adaptadores |
| **Shared** | `src/shared/` | Utilidades, decoradores, constantes, guards globales |

### 1.3 Módulos NestJS

| Módulo | Responsabilidad |
|--------|----------------|
| `AuthModule` | Login, JWT, refresh token, recuperación de contraseña |
| `UsuariosModule` | CRUD de usuarios (funcionarios y administradores) |
| `CiudadanosModule` | Gestión del perfil del ciudadano |
| `MotocicletasModule` | Registro y búsqueda de motocicletas |
| `SolicitudesModule` | Ciclo de vida completo de las solicitudes |
| `DocumentosModule` | Carga, gestión y descarga de adjuntos |
| `PermisosModule` | Generación, consulta y revocación de permisos |
| `QRModule` | Generación y validación del código QR |
| `PDFModule` | Generación del documento PDF institucional |
| `NotificacionesModule` | Cola de correos con BullMQ |
| `ReportesModule` | Generación y exportación de reportes |
| `AuditoriaModule` | Consulta de la bitácora de auditoría |
| `ConfiguracionModule` | Gestión de parámetros del sistema |
| `MotivosModule` | CRUD del catálogo de motivos |
| `DependenciasModule` | CRUD del catálogo de dependencias |
| `StorageModule` | Adaptador de MinIO (URLs firmadas, subida) |
| `HealthModule` | Endpoint de salud del sistema |

### 1.4 Estructura de Directorios

```
backend/
├── src/
│   ├── domain/
│   │   ├── solicitudes/
│   │   │   ├── entities/solicitud.entity.ts
│   │   │   ├── repositories/solicitud.repository.interface.ts
│   │   │   └── value-objects/numero-radicado.vo.ts
│   │   └── permisos/
│   │       ├── entities/permiso.entity.ts
│   │       └── repositories/permiso.repository.interface.ts
│   ├── application/
│   │   ├── solicitudes/
│   │   │   ├── use-cases/crear-solicitud.use-case.ts
│   │   │   ├── use-cases/aprobar-solicitud.use-case.ts
│   │   │   └── dtos/crear-solicitud.dto.ts
│   │   └── auth/
│   │       └── use-cases/login.use-case.ts
│   ├── infrastructure/
│   │   ├── http/
│   │   │   ├── controllers/solicitudes.controller.ts
│   │   │   └── guards/jwt-auth.guard.ts
│   │   ├── database/
│   │   │   ├── typeorm/
│   │   │   │   ├── entities/solicitud.typeorm.entity.ts
│   │   │   │   └── repositories/solicitud.typeorm.repository.ts
│   │   │   └── migrations/
│   │   ├── storage/minio.adapter.ts
│   │   ├── email/nodemailer.adapter.ts
│   │   └── queue/bullmq.adapter.ts
│   └── shared/
│       ├── decorators/roles.decorator.ts
│       ├── filters/global-exception.filter.ts
│       └── interceptors/audit.interceptor.ts
├── test/
│   ├── unit/
│   └── integration/
└── package.json

frontend/
├── src/
│   ├── app/
│   │   ├── (public)/              # Portal ciudadano
│   │   │   ├── page.tsx           # Inicio
│   │   │   ├── solicitar/         # Formulario de solicitud
│   │   │   ├── consultar/         # Consulta de estado
│   │   │   └── verificar/[qr]/    # Validación del QR
│   │   ├── (auth)/                # Login
│   │   ├── funcionario/           # Panel funcionario
│   │   └── admin/                 # Panel administrador
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   │   ├── api.ts                 # Cliente HTTP
│   │   └── auth.ts                # Gestión de tokens
│   └── types/
└── package.json
```

---

## 2. Tecnologías

### 2.1 Stack Completo

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|:-------:|-----------|
| **Runtime** | Node.js | 20 LTS | Entorno de ejecución |
| **Lenguaje** | TypeScript | 5.x | Tipado estático |
| **Backend** | NestJS | 10.x | Framework API REST |
| **Frontend** | Next.js | 14.x | Framework React con SSR |
| **Estilos** | TailwindCSS | 3.x | Estilos utilitarios |
| **BD** | PostgreSQL | 15.x | Base de datos principal |
| **ORM** | TypeORM | 0.3.x | Mapeo objeto-relacional |
| **Caché/Cola** | Redis | 7.x | Caché + BullMQ |
| **Cola** | BullMQ | 4.x | Procesamiento asíncrono |
| **Storage** | MinIO | RELEASE.2024 | Almacenamiento de objetos |
| **PDF** | PDFKit / Puppeteer | Último | Generación de PDFs |
| **QR** | qrcode | 1.x | Generación de imágenes QR |
| **Auth** | JWT + Passport | — | Autenticación |
| **Correo** | Nodemailer | 6.x | Envío de correos SMTP |
| **Validación** | class-validator | 0.14.x | Validación de DTOs |
| **Logs** | Pino | 8.x | Logger estructurado JSON |
| **Tests** | Jest | 29.x | Pruebas unitarias e integración |
| **E2E** | Playwright | 1.x | Pruebas de extremo a extremo |
| **Contenedores** | Docker + Docker Compose | 24.x | Empaquetado y despliegue |
| **HTTP Server** | Nginx | 1.25.x | Reverse proxy + SSL |
| **CAPTCHA** | reCAPTCHA v3 | Google | Protección de formularios |

---

## 3. Instalación

### 3.1 Requisitos de Desarrollo

| Software | Versión | Verificar |
|---------|:-------:|---------|
| Node.js | ≥ 20.x | `node --version` |
| npm | ≥ 10.x | `npm --version` |
| Docker Desktop | ≥ 4.x | `docker --version` |
| Docker Compose | ≥ 2.x | `docker compose version` |
| Git | ≥ 2.40 | `git --version` |

### 3.2 Instalación del Proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/alcaldia/pyp-sistema.git
cd pyp-sistema

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Iniciar los servicios de infraestructura
docker compose up -d

# 4. Instalar dependencias del backend
cd backend && npm install

# 5. Ejecutar migraciones
npm run migration:run

# 6. Ejecutar seeds
npm run seed:run

# 7. Instalar dependencias del frontend
cd ../frontend && npm install
```

### 3.3 Verificar la Instalación

```bash
# Verificar que PostgreSQL está listo
docker compose exec postgres pg_isready

# Verificar que Redis está listo
docker compose exec redis redis-cli ping

# Verificar que MinIO está listo
curl http://localhost:9000/minio/health/live

# Verificar el backend
curl http://localhost:3000/api/v1/health

# Verificar el frontend
curl http://localhost:3001
```

---

## 4. Configuración

### 4.1 Variables de Entorno Obligatorias

Todas las variables marcadas con (*) son obligatorias para que el sistema funcione:

| Variable | Obligatoria | Ejemplo | Descripción |
|---------|:-----------:|---------|-------------|
| `NODE_ENV` | * | `development` | Entorno de ejecución |
| `DATABASE_HOST` | * | `localhost` | Host de PostgreSQL |
| `DATABASE_NAME` | * | `pyp_db` | Nombre de la base de datos |
| `DATABASE_USER` | * | `pyp_user` | Usuario de BD |
| `DATABASE_PASSWORD` | * | `secreto` | Contraseña de BD |
| `REDIS_HOST` | * | `localhost` | Host de Redis |
| `JWT_SECRET` | * | `min-64-chars...` | Clave secreta JWT |
| `MINIO_ENDPOINT` | * | `localhost` | Host de MinIO |
| `MINIO_ACCESS_KEY` | * | `minioadmin` | Access key de MinIO |
| `MINIO_SECRET_KEY` | * | `minioadmin` | Secret key de MinIO |
| `SMTP_HOST` | * | `smtp.gmail.com` | Host del servidor SMTP |
| `SMTP_USER` | * | `noreply@...` | Usuario SMTP |
| `SMTP_PASSWORD` | * | `contraseña` | Contraseña SMTP |
| `RECAPTCHA_SECRET_KEY` | * | `6L...` | Key de Google reCAPTCHA v3 |
| `QR_SALT` | * | `salt-aleatorio` | Salt para generar códigos QR |
| `QR_BASE_URL` | * | `http://localhost:3001/verificar` | URL base para QR |

### 4.2 Configuración de NestJS

El proyecto usa `@nestjs/config` con validación por esquema Joi en el módulo principal. La configuración se centraliza en `src/config/` con archivos por dominio:

- `database.config.ts`: Configuración de TypeORM y PostgreSQL.
- `redis.config.ts`: Configuración de Redis y BullMQ.
- `jwt.config.ts`: Parámetros de JWT.
- `storage.config.ts`: Configuración de MinIO.
- `mail.config.ts`: Configuración de SMTP.

---

## 5. Variables de Entorno

Ver sección completa de variables en `docs/PLAN_DESPLIEGUE.md` > Sección 5.

El archivo `.env.example` en la raíz del proyecto contiene todas las variables con descripción. Nunca versionar el archivo `.env` real.

---

## 6. Compilación

### 6.1 Backend

```bash
# Compilar TypeScript a JavaScript
cd backend && npm run build

# Verificar que la compilación no tiene errores de tipos
npm run type-check

# El output está en: backend/dist/
```

### 6.2 Frontend

```bash
# Build de producción de Next.js
cd frontend && npm run build

# El output está en: frontend/.next/
# El modo standalone en: frontend/.next/standalone/
```

### 6.3 Docker (Producción)

```bash
# Build de las imágenes de producción
docker compose -f docker-compose.prod.yml build

# Build de una sola imagen
docker compose -f docker-compose.prod.yml build backend
```

---

## 7. Ejecución

### 7.1 Modo Desarrollo (con hot-reload)

```bash
# Terminal 1: Infraestructura
docker compose up -d

# Terminal 2: Backend
cd backend && npm run start:dev

# Terminal 3: Frontend
cd frontend && npm run dev

# Terminal 4: Worker BullMQ (si se ejecuta separado)
cd backend && npm run worker:dev
```

### 7.2 Modo Producción con Docker Compose

```bash
# Iniciar todos los servicios
docker compose -f docker-compose.prod.yml up -d

# Ver estado de los servicios
docker compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f backend

# Reiniciar un servicio específico
docker compose -f docker-compose.prod.yml restart backend
```

### 7.3 Scripts npm Disponibles

#### Backend (`backend/package.json`)

| Script | Descripción |
|--------|-------------|
| `start:dev` | Desarrollo con hot-reload |
| `start:prod` | Producción (`node dist/main.js`) |
| `build` | Compilar TypeScript |
| `type-check` | Verificar tipos sin compilar |
| `test` | Ejecutar pruebas unitarias |
| `test:integration` | Ejecutar pruebas de integración |
| `test:cov` | Pruebas con reporte de cobertura |
| `migration:generate` | Generar nueva migración desde entidades |
| `migration:run` | Ejecutar migraciones pendientes |
| `migration:revert` | Revertir la última migración |
| `seed:run` | Ejecutar los seeds de datos iniciales |
| `lint` | Verificar estilo de código |
| `worker:dev` | Iniciar workers BullMQ en modo desarrollo |

#### Frontend (`frontend/package.json`)

| Script | Descripción |
|--------|-------------|
| `dev` | Desarrollo con hot-reload |
| `build` | Build de producción |
| `start` | Servidor de producción |
| `lint` | Verificar estilo de código |
| `type-check` | Verificar tipos |
| `test:e2e` | Ejecutar pruebas E2E con Playwright |

---

## 8. Base de Datos

### 8.1 Migraciones

Las migraciones de TypeORM son la única forma autorizada de modificar el esquema de la base de datos. Nunca modificar el esquema directamente con SQL en producción.

```bash
# Generar una nueva migración basada en cambios en las entidades
npm run migration:generate -- src/infrastructure/database/migrations/NombreDeLaMigracion

# Ejecutar todas las migraciones pendientes
npm run migration:run

# Revertir la última migración aplicada
npm run migration:revert

# Ver el estado de las migraciones
npm run migration:show
```

### 8.2 Seeds

Los seeds cargan los datos mínimos necesarios para que el sistema funcione. Solo deben ejecutarse una vez en un ambiente nuevo.

**Orden de ejecución de seeds:**
1. `roles.seed.ts` — Roles: `administrador`, `funcionario`.
2. `motivos.seed.ts` — 9 motivos de solicitud predeterminados.
3. `configuracion.seed.ts` — 9 parámetros de configuración con valores por defecto.
4. `admin.seed.ts` — Usuario administrador inicial.

```bash
npm run seed:run
```

### 8.3 Diagrama Entidad-Relación

El diagrama Mermaid completo está en `docs/MODELO_DATOS.md`.

### 8.4 Acceso Directo a la Base de Datos

```bash
# Conectar a PostgreSQL en desarrollo
docker compose exec postgres psql -U pyp_user -d pyp_db

# Listar tablas
\dt

# Consultar solicitudes recientes
SELECT numero_radicado, estado, created_at FROM solicitudes ORDER BY created_at DESC LIMIT 10;

# Salir
\q
```

---

## 9. Docker

### 9.1 Estructura de Archivos Docker

```
proyecto/
├── docker-compose.yml              # Desarrollo
├── docker-compose.prod.yml         # Producción
├── backend/
│   └── Dockerfile                  # Multi-stage build del backend
├── frontend/
│   └── Dockerfile                  # Multi-stage build del frontend
└── docker/
    ├── nginx/
    │   └── nginx.conf
    └── postgres/
        └── init.sql
```

### 9.2 Comandos Útiles de Docker

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend

# Entrar a un contenedor
docker compose exec backend sh

# Ver el uso de recursos
docker stats

# Eliminar contenedores y volúmenes (¡BORRA LOS DATOS!)
docker compose down -v

# Reconstruir imágenes sin caché
docker compose build --no-cache
```

### 9.3 Volúmenes Persistentes

| Volumen | Contenedor | Datos que contiene |
|---------|-----------|-------------------|
| `pyp_postgres_data` | postgres | Datos de la base de datos |
| `pyp_redis_data` | redis | Datos de Redis (RDB) |
| `pyp_minio_data` | minio | Archivos subidos (documentos, PDFs) |

---

## 10. Swagger

### 10.1 Acceso

- **Desarrollo:** `http://localhost:3000/api/docs`
- **Staging:** `https://staging.dominio.gov.co/api/docs`
- **Producción:** No exponer Swagger en producción. Solo disponible en red interna o con autenticación básica.

### 10.2 Configuración

Swagger está configurado en `src/main.ts` usando `@nestjs/swagger`. El documento es generado automáticamente a partir de los decoradores en los controladores y DTOs.

**Decoradores requeridos en cada endpoint:**
- `@ApiTags('nombre-del-módulo')` — Agrupa los endpoints.
- `@ApiOperation({ summary: '...' })` — Descripción del endpoint.
- `@ApiResponse({ status: 200, description: '...' })` — Respuestas posibles.
- `@ApiBearerAuth()` — Indica que el endpoint requiere JWT.

### 10.3 Autenticación en Swagger

Para probar endpoints autenticados en Swagger:
1. Hacer `POST /api/v1/auth/login` con credenciales.
2. Copiar el `access_token` de la respuesta.
3. Hacer clic en "Authorize" (ícono del candado).
4. Pegar el token en el campo `Bearer Token`.
5. Los endpoints autenticados ahora incluirán el header `Authorization`.

---

## 11. Mantenimiento

### 11.1 Tareas Periódicas

| Tarea | Frecuencia | Responsable |
|-------|:----------:|-------------|
| Verificar que el backup nocturno fue exitoso | Diaria | TI |
| Revisar la cola DLQ de BullMQ | Diaria | TI |
| Verificar espacio en disco (servidor + MinIO) | Semanal | TI |
| Actualizar dependencias de seguridad (`npm audit fix`) | Mensual | Desarrollo |
| Prueba de restauración de backup | Mensual | TI |
| Revisar queries lentos en PostgreSQL (`pg_stat_statements`) | Mensual | DBA |
| Rotar credenciales y API keys | Trimestral | Seguridad |
| Actualizar certificado SSL (Certbot lo hace automáticamente) | Automático | — |

### 11.2 Cómo Crear el Primer Usuario Administrador

Si los seeds no fueron ejecutados o el usuario admin fue eliminado:

```bash
# Opción 1: Ejecutar el seed de admin
docker compose exec backend npm run seed:admin

# Opción 2: Inserción directa en BD (emergencia)
docker compose exec postgres psql -U pyp_user -d pyp_db -c "
  INSERT INTO usuarios (id, nombre, apellido, email, contrasena_hash, rol_id, activo)
  VALUES (
    gen_random_uuid(),
    'Admin',
    'Sistema',
    'admin@alcaldia.gov.co',
    -- Hash BCrypt de 'Admin@2026!' (cambiar inmediatamente)
    '\$2b\$12\$...',
    (SELECT id FROM roles WHERE nombre = 'administrador'),
    true
  );
"
```

**Importante:** Cambiar la contraseña del usuario admin inmediatamente tras el primer login.

### 11.3 Gestión de la Cola BullMQ

Los workers de BullMQ procesan de forma automática. Para intervención manual:

```bash
# Ver jobs en la cola (requiere Redis CLI)
docker compose exec redis redis-cli

# Listar todas las colas
KEYS bull:*

# Ver jobs en estado failed (Dead Letter Queue)
LRANGE bull:pyp-pdf:failed 0 -1

# Reintentar todos los jobs fallidos desde el panel admin
# o via endpoint: POST /api/v1/admin/queue/retry-failed
```

### 11.4 Limpiar Archivos de Reportes Antiguos en MinIO

Los reportes exportados tienen una URL firmada de 5 minutos, pero el archivo permanece en MinIO. Ejecutar limpieza periódica:

```bash
# Listar archivos en el bucket de reportes
docker compose exec minio mc ls local/pyp-reportes

# Eliminar archivos de más de 30 días
docker compose exec minio mc rm --recursive --older-than 30d local/pyp-reportes/
```

---

## 12. Buenas Prácticas

### 12.1 Código

| Práctica | Descripción |
|---------|-------------|
| **Un use case por archivo** | Cada caso de uso tiene su propio archivo en `application/use-cases/`. |
| **DTOs para todos los inputs** | Usar `class-validator` en todos los DTOs. Nunca procesar el body directamente. |
| **Repositorios detrás de interfaces** | Los use cases dependen de la interfaz, no de la implementación TypeORM. |
| **Sin lógica en los controladores** | Los controladores solo transforman la request/response y delegan al use case. |
| **Sin SQL embebido** | Usar siempre TypeORM Query Builder o repositorios. |
| **Errores tipados** | Crear excepciones de dominio específicas (`SolicitudNoEncontradaException`, etc.). |
| **Sin `any` en TypeScript** | Tipado estricto en todo el código. `tsconfig.json` con `strict: true`. |

### 12.2 Seguridad

| Práctica | Descripción |
|---------|-------------|
| **Sanitizar antes de loguear** | El interceptor global elimina campos sensibles del log. |
| **Nunca loguear secrets** | JWT, contraseñas, storage_key no deben aparecer en logs. |
| **Usar `crypto.timingSafeEqual`** | Para comparaciones de tiempo constante cuando no se usa BCrypt. |
| **Validar en el backend** | La validación del frontend es solo UX. El backend siempre revalida. |
| **URLs firmadas** | Nunca retornar rutas directas del storage en ninguna respuesta de API. |

### 12.3 Base de Datos

| Práctica | Descripción |
|---------|-------------|
| **Migraciones para todo** | Ningún cambio de esquema fuera de una migración versionada. |
| **Índices justificados** | Todo índice debe tener una query que lo justifique documentada en la migración. |
| **Soft delete por defecto** | Todas las tablas transaccionales usan `deleted_at`. |
| **`EXPLAIN ANALYZE`** | Todas las queries de producción nuevas deben ser analizadas. |
| **Sin N+1** | Usar `leftJoinAndSelect` en TypeORM o `DataLoader` para evitar N+1. |

### 12.4 Git

| Práctica | Descripción |
|---------|-------------|
| **GitFlow** | Ramas: `main`, `develop`, `feature/*`, `hotfix/*`. |
| **Commits atómicos** | Un commit por cambio lógico con mensaje descriptivo. |
| **Sin secrets en Git** | Verificar con `git-secrets` o `detect-secrets` antes de hacer push. |
| **PR para todo** | Ningún commit directo a `develop` o `main`. Todo por pull request con revisión. |
| **Tests en CI** | El pipeline de CI falla si las pruebas unitarias no pasan. |

---

*Para dudas técnicas, consultar primero la documentación en `/docs`. Si el problema persiste, abrir un issue en el repositorio.*
