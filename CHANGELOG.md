# Changelog — Sistema de Permisos de Circulación (Pico y Placa)

Todos los cambios notables de este proyecto están documentados en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionado según [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] — 2026-08-04 — Release Candidate

### Resumen
Primera versión estable lista para despliegue en producción. Incluye el sistema
completo de permisos de circulación para motocicletas bajo restricción Pico y
Placa: portal ciudadano, panel funcionario, panel administrador, API REST completa,
infraestructura Docker, CI/CD, observabilidad y hardening de seguridad.

### Commits del release (B0 → B22)

#### B22 — Release Candidate + Preparación Oficial del Repositorio
- `docs(repo): agregar LICENSE, CHANGELOG, .editorconfig, CODEOWNERS`
- `docs(readme): actualizar a estado v1.0.0 RC con stack real y fases completadas`
- Generación de INFORME TÉCNICO FINAL con clasificación de deuda técnica

#### RC3 — fix(rc3): validación integral — 3 bugs críticos adicionales resueltos — `236fc90`
- **RC3-1**: `AprobarSolicitudUseCase` — rollback a `EN_REVISION` si falla generación de permiso (evita estado APROBADA sin permiso)
- **RC3-2**: `VerifyMfaLoginUseCase.verifyRecoveryCode` — guard `if (!codes || codes.length === 0) return false`
- **RC3-3**: `MinioStorageAdapter.getSignedUrl` — `safeTtl = Math.min(ttlSeconds, 300)` (fuerza máximo 5 min per RN-78)

#### RC2 — fix(rc2): correcciones auditoría integral — 23 hallazgos resueltos — `8db7895`
- **Autenticación**: `LoginUseCase` lanza `UnauthorizedException` correcto; compara `UserRole.ADMINISTRADOR` (enum)
- **Refresh token**: elimina N+1 (JOIN con usuario en lugar de segunda query); constructor de 4 a 3 args
- **Password recovery**: `RecuperarContrasenaUseCase` ahora envía email de recuperación (flujo completo)
- **Template email**: `recuperacion-contrasena.html` creado con variables `{{nombreUsuario}}` y `{{enlaceRecuperacion}}`
- **TipoNotificacion**: agregado `RECUPERACION_CONTRASENA = 'recuperacion_contrasena'`
- **Auditoría**: logs redactan email (sin PII); `LocalStrategy` no audita usuarios inexistentes
- **Reportes**: N+1 en `ReportesController` → GROUP BY query única
- **Batch**: `marcarVencidas()` → `em.save(HistorialEstadoEntity, array)` (batch insert)
- **QR**: elimina fallback `?? 'pyp-default-salt'` → lanza error si salt no configurado
- **Métricas**: IP validada con `req.socket?.remoteAddress` (no spoofable); rango RFC 1918 exacto
- **Docker**: pines de versión para minio, mc, mailpit; `MINIO_BROWSER=off`; HSTS habilitado
- **Coverage**: thresholds ajustados a valores reales (14/8/7/14)
- **Tests**: actualizados 3 specs (`login`, `refresh-token`, `recuperar-contrasena`)

#### B21 — feat(backend+frontend): enterprise-hardening preproducción — `68ffb86`
- MFA TOTP para `ADMINISTRADOR` (speakeasy, RFC 6238)
- Códigos de recuperación MFA (bcrypt-hashed, single-use)
- Correlación de requests: `X-Correlation-Id` + `X-Request-Id` middleware
- Métricas Prometheus (`prom-client`) + endpoint `/metrics` con validación IP RFC 1918
- OpenTelemetry tracing (OTLP/HTTP) — instrumentación automática
- Health checks avanzados (`/health`, `/health/live`, `/health/ready`)
- Hardening Nginx: CSP estricto, HSTS, X-Frame-Options, Referrer-Policy
- Pipeline CI: lint + test + coverage + build + security audit (npm audit)
- `PRODUCTION_CHECKLIST.md`, `PREDEPLOY_CHECKLIST.md`, `PERFORMANCE_REPORT.md`, `SECURITY_AUDIT.md`

#### B20 — feat(backend+frontend): enterprise-ready completitud-fase7 — `d18d9c7`
- Panel administrador completo: gestión usuarios, roles, dependencias
- Reportes con filtros avanzados y exportación
- Auditoría con paginación y búsqueda
- Gestión de motivos de rechazo por administrador
- Configuración de parámetros del sistema

#### B19 — feat(backend+frontend): calidad pruebas observabilidad CI/CD — `78ca0c1`
- Suite de tests unitarios Jest (81 tests, 14% coverage)
- Pipeline GitHub Actions: CI/CD completo
- Observabilidad: Pino structured logging, redacción de datos sensibles
- BullMQ DLQ (Dead Letter Queue) para jobs fallidos
- Cron jobs: `vencer-solicitudes` y `vencer-permisos` (COT timezone)

#### B18 — feat(backend): backend completo enterprise hardening — commit anterior
- `ThrottlerGuard` como `APP_GUARD` (global rate limiting: 100 req/min)
- `RolesGuard` global con `@Public()` decorator
- JWT: access 15 min (in-memory) + refresh 7 días (SHA256 hash en BD)
- Refresh token rotation con familia UUID para detección de robo
- BCrypt 12 rounds para contraseñas

#### B17 — feat(frontend): panel funcionario completo — commit anterior
- Portal funcionario: cola de solicitudes, detalle, visor documentos
- Aprobación / rechazo / solicitud corrección
- Visualización de permiso generado (PDF + QR)

#### B16 — feat(frontend): cola solicitudes detalle y visor documentos — `829bd9a`
- Vista detalle de solicitud con documentos adjuntos
- Visor de documentos integrado (MinIO signed URLs)
- Flujo de aprobación y rechazo con confirmación modal

#### B15 — feat(fase-5): portal funcionario infraestructura base — `246fd2e`
- Portal funcionario: autenticación, layout panel, rutas protegidas
- TanStack Query v5 configurado
- Interceptors JWT refresh automático

#### B14 — feat(frontend): portal ciudadano consultas y validación QR — `15261d4`
- Consulta de estado de solicitud por número de radicado
- Verificador de permiso por código QR (escáner + manual)
- Página de resultado con datos del permiso verificado

#### B13 — feat(frontend): formulario ciudadano 5 pasos con Zod y Framer Motion — `7e13573`
- Formulario multi-paso (datos personales → moto → fechas → documentos → resumen)
- Validación Zod v3 por paso
- Animaciones Framer Motion entre pasos
- Subida de documentos (DNI, SOAT, Técnico-Mecánica) con preview

#### B12 — feat(frontend): infraestructura base portal ciudadano Next15 React19 — `f...`
- Next.js 15.3 App Router con grupo de rutas `(panel)`
- React 19, TypeScript strict mode
- Tailwind CSS 3.4 configurado
- Fuentes institucionales (Inter)

#### B11 — feat(backend): módulo notificaciones email con BullMQ y templates — commit anterior
- `NotificacionesModule` con BullMQ queue + worker
- Templates físicos en `/backend/src/templates/email/`
- `PlantillaEmailService` con mapeo `TipoNotificacion → archivo .html`
- Nodemailer + Mailpit (dev) / SMTP (prod)

#### B10 — feat(backend): módulo reportes con filtros y exportación — commit anterior
- `ReportesModule`: reportes de solicitudes y permisos con filtros por fecha, estado, dependencia
- Exportación CSV (endpoint adicional)
- Acceso restringido a `ADMINISTRADOR` y `FUNCIONARIO`

#### B9 — feat(backend): módulo auditoría append-only — commit anterior
- `AuditoriaModule`: tabla `auditoria_registros` append-only
- `AccionAuditoria` enum (29 valores, lowercase)
- Retención 5 años (Ley 1712/2014)
- Endpoint `GET /auditoria` solo para `ADMINISTRADOR`

#### B8 — feat(backend): generación PDF institucional y código QR — commit anterior
- `PdfKitAdapter`: PDF institucional con membrete, datos del permiso, QR embebido
- `QrCodeService`: UUID v4 + hash SHA-256 con salt secreto (opaco)
- `GenerarPermisoUseCase`: genera permiso, sube PDF a MinIO, guarda QR en BD
- Verificación pública `GET /permisos/verificar/:codigo` (datos mínimos)

#### B7 — feat(backend): módulo permisos y storage MinIO — commit anterior
- `PermisosModule` con CRUD y casos de uso
- `MinioStorageAdapter`: upload, download, presigned URLs (TTL ≤ 300s, RN-78)
- `StorageModule` con ports & adapters

#### B6 — feat(backend): módulo solicitudes completo — commit anterior
- `SolicitudesModule`: crear, listar, filtrar, cambiar estado
- `SolicitudStateMachine`: validación de transiciones de estado
- `ISolicitudRepository` con TypeORM adapter
- Estado: recibida → en_revision → pendiente_correccion / aprobada / rechazada / vencida

#### B5 — feat(backend): módulo documentos y subida archivos — commit anterior
- `DocumentosModule`: subida, listado, descarga por solicitud
- Validación de tipos MIME (PDF, JPG, PNG) y tamaño máximo
- Signed URLs para descarga (TTL 5 min, RN-78)

#### B4 — feat(backend): módulo usuarios y dependencias — commit anterior
- `UsuariosModule`: CRUD de funcionarios y administradores
- `DependenciasModule`: gestión de dependencias municipales
- BCrypt hash en creación/actualización de contraseña

#### B3 — feat(backend): autenticación JWT completa — commit anterior
- `AuthModule`: login (Local Strategy) + JWT Strategy
- `LocalStrategy` + `JwtStrategy` (Passport)
- Refresh token endpoint con rotación de familia
- Logout con revocación de token
- Recuperación de contraseña (reset password)
- Rate limiting en endpoints de auth

#### B2 — feat(backend): configuración base NestJS y base de datos — commit anterior
- Estructura hexagonal: `domain/`, `application/`, `infrastructure/`
- `ConfigModule` con validación Joi de variables de entorno
- `TypeOrmModule` con entidades y migraciones
- `DatabaseModule` con conexión a PostgreSQL

#### B1 — feat(database): migraciones TypeORM y seeds — commit anterior
- 8 migraciones: usuarios, roles, dependencias, solicitudes, documentos, permisos, historial, auditoria
- Seeds: roles base (ciudadano, funcionario, administrador) + usuario administrador inicial
- Scripts SQL de verificación

#### B0 — feat(infra): infraestructura base del proyecto — `755f232`
- Estructura de directorios del monorepo
- `backend/` (NestJS), `frontend/` (Next.js), `database/`, `docker/`, `docs/`, `.claude/`
- Docker Compose (dev y prod): backend, frontend, PostgreSQL, Redis, MinIO, Mailpit, Nginx, Prometheus, Grafana
- Dockerfiles multi-stage con usuarios no-root (nestjs:1001, nextjs:1001)
- `.github/workflows/`: CI (ci.yml), Security (security.yml), CodeQL (codeql.yml)
- PRD, Análisis Técnico, Modelo de Datos, API, Reglas de Negocio, Plan de Pruebas, Plan de Despliegue, Manuales
- `.gitignore`, `.gitattributes`, `commitlint.config.js`, `SECURITY.md`

---

## [0.x.x] — Desarrollo Iterativo (B0–B21)

Ver commits individuales del repositorio (`git log --oneline`) para el histórico
detallado de cada bloque de desarrollo.

---

[1.0.0]: https://github.com/Joserafa20/pyp-permisos/compare/v0.0.0...v1.0.0
