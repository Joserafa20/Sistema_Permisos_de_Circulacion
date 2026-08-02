# ARCHITECTURE

## Estilo Arquitectónico

**Arquitectura Hexagonal (Ports & Adapters)** aplicada dentro de cada módulo NestJS.
Combina con principios de **Clean Architecture** para separar dominio, aplicación e infraestructura.

---

## Principios

| Principio | Aplicación |
|-----------|-----------|
| Alta cohesión | Cada módulo encapsula un único dominio |
| Bajo acoplamiento | El dominio no depende de frameworks ni BD |
| Dependency Inversion | El dominio define interfaces; la infraestructura las implementa |
| SOLID | Aplicado en services, repositories y use cases |
| Modularidad | Un módulo NestJS por dominio de negocio |
| Testabilidad | Los puertos permiten sustituir adaptadores por mocks en tests |

---

## Capas por Módulo (Backend)

```
src/
└── modulo/
    ├── domain/                        ← Núcleo de negocio (sin dependencias externas)
    │   ├── entities/                  ← Entidades de dominio
    │   ├── value-objects/             ← Objetos de valor (placa, radicado, etc.)
    │   └── ports/
    │       ├── in/                    ← Puertos de entrada (use cases / interfaces)
    │       └── out/                   ← Puertos de salida (repos, servicios externos)
    │
    ├── application/                   ← Orquesta el dominio
    │   ├── use-cases/                 ← Implementación de cada caso de uso
    │   └── dto/                       ← Data Transfer Objects (entrada/salida)
    │
    └── infrastructure/               ← Adaptadores concretos
        ├── persistence/               ← TypeORM entities, repositories, migrations
        ├── controllers/               ← NestJS controllers (HTTP adapter)
        ├── guards/                    ← JWT Guard, Roles Guard
        ├── interceptors/              ← Logging, Transform Response
        ├── middleware/                ← Rate limit, Audit
        └── adapters/                  ← PDF, QR, Email, Storage, Queue
```

---

## Puertos de Entrada (Driving Ports)

Interfaces que el dominio expone para ser invocado desde la capa de aplicación:

```typescript
// Solicitudes
ICrearSolicitudUseCase
IConsultarEstadoSolicitudUseCase
IAprobarSolicitudUseCase
IRechazarSolicitudUseCase
ISolicitarCorreccionUseCase

// Permisos
IGenerarPermisoUseCase
IValidarQRUseCase
IRevocarPermisoUseCase

// Usuarios
IAutenticarUsuarioUseCase
ICrearUsuarioUseCase
IGestionarContrasenaUseCase

// Reportes
IGenerarReporteUseCase
```

---

## Puertos de Salida (Driven Ports)

Interfaces que el dominio define para depender de servicios externos:

```typescript
// Persistencia
ISolicitudRepository
IPermisoRepository
ICiudadanoRepository
IMotocicletaRepository
IUsuarioRepository
IAuditoriaRepository
IConfiguracionRepository

// Servicios externos
IStoragePort          // Guardar y recuperar archivos (MinIO/S3)
IEmailPort            // Enviar correos (Nodemailer/SendGrid)
IPDFGeneratorPort     // Generar PDF institucional
IQRGeneratorPort      // Generar imagen QR
IQueuePort            // Encolar tareas asíncronas (BullMQ)
ICaptchaPort          // Validar token reCAPTCHA
```

---

## Módulos NestJS

| Módulo | Responsabilidad |
|--------|----------------|
| `AuthModule` | Login, JWT, refresh token, recuperación de contraseña |
| `UsuariosModule` | CRUD de usuarios y roles internos |
| `CiudadanosModule` | Registro y consulta de ciudadanos |
| `MotocicletasModule` | Gestión de motocicletas |
| `SolicitudesModule` | Flujo completo de solicitudes (crear, revisar, aprobar, rechazar) |
| `DocumentosModule` | Carga, almacenamiento y descarga segura de adjuntos |
| `PermisosModule` | Generación, descarga, revocación de permisos |
| `QRModule` | Generación y validación pública del QR |
| `PDFModule` | Generación del PDF institucional |
| `NotificacionesModule` | Cola de correos electrónicos |
| `ReportesModule` | Dashboard, reportes y exportaciones |
| `AuditoriaModule` | Bitácora de acciones del sistema |
| `ConfiguracionModule` | Parámetros del sistema |
| `MotivosModule` | CRUD de motivos configurables |
| `DependenciasModule` | CRUD de dependencias de la alcaldía |
| `StorageModule` | Abstracción sobre MinIO/S3 |
| `HealthModule` | Health checks del sistema |

---

## Flujo de Procesamiento Asíncrono (Colas BullMQ)

```
Evento de aprobación
       ↓
  SolicitudesService
       ↓
  IQueuePort.encolar('generar-permiso', { solicitudId })
       ↓
  [Redis Queue]
       ↓
  PDFWorker                    EmailWorker
  ├── Genera PDF                ├── Envía correo al ciudadano
  ├── Sube a Storage            └── Registra en notificaciones
  ├── Genera QR
  ├── Crea registro en permisos
  └── Actualiza estado solicitud
```

**Reintentos:** Backoff exponencial, máximo 3 intentos.  
**Dead Letter Queue:** Tareas que fallan 3 veces se mueven a DLQ para revisión manual.

---

## Stack Tecnológico Completo

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Node.js | 20 LTS | Runtime |
| NestJS | 10+ | Framework |
| TypeScript | 5+ | Lenguaje |
| TypeORM | 0.3+ | ORM |
| BullMQ | 5+ | Colas asíncronas |
| Passport.js | — | Estrategias de autenticación |
| class-validator | — | Validación de DTOs |
| class-transformer | — | Transformación de respuestas |
| Helmet | — | Headers de seguridad HTTP |
| express-rate-limit | — | Rate limiting global |
| Winston/Pino | — | Logging estructurado JSON |
| PDFKit / Puppeteer | — | Generación de PDF institucional |
| qrcode | — | Generación de imagen QR |
| Nodemailer | — | Envío de correos |
| @aws-sdk/client-s3 | — | Cliente MinIO/S3 |
| uuid | — | Generación de UUIDs |

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Next.js | 14+ | Framework React (App Router) |
| React | 18+ | UI |
| TypeScript | 5+ | Lenguaje |
| TailwindCSS | 3+ | Estilos |
| React Hook Form | — | Manejo de formularios |
| Zod | — | Validación de esquemas en cliente |
| Axios | — | Cliente HTTP |
| React Query | — | Estado del servidor / caché |
| next-intl | — | Internacionalización (es-CO) |

### Infraestructura
| Tecnología | Uso |
|-----------|-----|
| PostgreSQL 15+ | Base de datos principal |
| Redis 7+ | Caché + colas BullMQ |
| MinIO | Almacenamiento de archivos (compatible S3) |
| Nginx | Reverse proxy + SSL termination |
| Docker + Docker Compose | Contenedores |
| GitHub Actions | CI/CD |

---

## Estructura de Directorios del Proyecto

```
SOFT-PICOYPLACA/
├── .claude/            ← Documentación del proyecto para Claude
├── docs/               ← PRD, análisis técnico, manuales
├── backend/            ← NestJS API
│   ├── src/
│   │   ├── modules/    ← Un directorio por módulo (ver lista de módulos)
│   │   ├── common/     ← Guards, interceptors, filters, decorators compartidos
│   │   ├── config/     ← ConfigModule con variables de entorno tipadas
│   │   └── main.ts
│   ├── test/
│   └── ...
├── frontend/           ← Next.js App
│   ├── app/
│   │   ├── (public)/   ← Portal ciudadano (sin auth)
│   │   ├── (auth)/     ← Login
│   │   ├── funcionario/← Panel del funcionario
│   │   └── admin/      ← Panel del administrador
│   ├── components/
│   └── ...
├── database/
│   ├── migrations/     ← TypeORM migrations
│   ├── seeds/          ← Datos iniciales
│   └── schema.sql      ← Script SQL completo
├── docker/
│   ├── backend/
│   ├── frontend/
│   └── nginx/
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## Seguridad en la Arquitectura

- **Nunca** el dominio conoce detalles de JWT, bcrypt ni HTTP. Esos son adaptadores de infraestructura.
- **Guards** de NestJS interceptan antes de llegar al controller: `JwtAuthGuard`, `RolesGuard`.
- **Global Exception Filter** transforma todos los errores a respuesta estándar sin exponer internos.
- **Logging Interceptor** registra entrada y salida de cada request (sin datos sensibles).
- **Audit Middleware** registra acciones en la tabla `auditoria` de forma transversal.

---

## Variables de Entorno Requeridas

Definidas en `ConfigModule` tipadas con validación al arrancar:

```
# Aplicación
NODE_ENV=
PORT=3001
FRONTEND_URL=

# Base de Datos
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=

# Redis
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

# Storage MinIO
STORAGE_ENDPOINT=
STORAGE_PORT=9000
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET_DOCS=
STORAGE_BUCKET_PDFS=
STORAGE_USE_SSL=false

# Email
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=

# reCAPTCHA
RECAPTCHA_SECRET_KEY=

# URL pública
PUBLIC_URL=https://dominio.gov.co
```
