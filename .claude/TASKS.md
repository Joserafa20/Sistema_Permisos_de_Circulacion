# TASKS.md

# Sistema Web de Permisos de Circulación de Motocicletas

## Estado General

**Proyecto:** En desarrollo
**Versión:** 0.1.0
**Última actualización:** 2026-08-02
**Fuente de verdad del roadmap:** `.claude/ROADMAP.md`

> **Nota:** Este archivo es el tracking granular de la fase activa. La estructura de fases (0–8)
> es idéntica a `ROADMAP.md`. Ante cualquier divergencia, prevalece `ROADMAP.md`.
>
> **Progreso:** Se calcula automáticamente contando `[x]` vs total de tareas en la fase activa.
> No se usan porcentajes fijos. Ver ROADMAP.md para el resumen por fase.

---

## Leyenda de Estados

| Símbolo | Significado |
|---------|-------------|
| `[ ]` | Pendiente |
| `[~]` | Pendiente de Diseño — requiere decisión antes de implementar |
| `[>]` | En progreso |
| `[x]` | Completado |

---

## Fase 0 — Fundamentos
**Objetivo:** Entorno de desarrollo listo y uniforme para todo el equipo.
**Semana:** 1
**Dependencia:** Ninguna. Punto de partida.
**Estado:** ✅ Completada
**Progreso:** 12 / 12 tareas completadas

- [x] Repositorio Git + GitFlow (main, develop, feature/*, hotfix/*) ✅ 2026-08-02
- [x] `.gitignore` completo (Node, env, build) ✅ 2026-08-02
- [x] Docker Compose: PostgreSQL + Redis + MinIO ✅ 2026-08-02
- [x] Backend NestJS: scaffolding base con ConfigModule tipado
- [x] Frontend Next.js: scaffolding base con App Router y TailwindCSS ✅ 2026-08-04 (B12)
- [x] Archivo `.env.example` completo con todas las variables
- [x] ESLint + Prettier configurados
- [x] Husky (pre-commit hooks) ✅ 2026-08-02
- [x] Frontend Next.js: scaffolding base con App Router y TailwindCSS ✅ 2026-08-02
- [x] Swagger configurado y accesible en `/api/docs`
- [x] Endpoint `/api/v1/health` operativo
- [x] Logger estructurado (Pino) configurado
- [x] README.md con instrucciones de setup local

**Completado en esta sesión (Backend):**
- [x] `package.json` con todas las dependencias de Fase 0
- [x] `tsconfig.json` + `tsconfig.build.json` — TypeScript 5 estricto
- [x] `nest-cli.json` — configuración del CLI
- [x] `.eslintrc.js` — reglas TypeScript + Prettier
- [x] `.prettierrc` — formato de código unificado
- [x] `.gitignore` del backend
- [x] `src/config/configuration.ts` — todas las variables tipadas
- [x] `src/config/validation.schema.ts` — validación Joi al arrancar
- [x] `src/config/typeorm-cli.config.ts` — DataSource para CLI de migraciones
- [x] `src/common/interfaces/api-response.interface.ts` — contratos de respuesta
- [x] `src/common/decorators/roles.decorator.ts` — @Roles() + enum UserRole
- [x] `src/common/filters/http-exception.filter.ts` — errores estándar sin exponer stack
- [x] `src/common/interceptors/logging.interceptor.ts` — log de cada request
- [x] `src/common/interceptors/response-transform.interceptor.ts` — envoltura estándar
- [x] `src/modules/health/health.controller.ts` — GET /api/v1/health
- [x] `src/modules/health/health.module.ts`
- [x] `src/app.module.ts` — ConfigModule + TypeOrmModule + LoggerModule + HealthModule
- [x] `src/main.ts` — bootstrap completo con Helmet, CORS, pipes, filtros, Swagger
- [x] `test/app.e2e-spec.ts` — tests E2E del health check y manejo de errores
- [x] `test/jest-e2e.json` — configuración Jest E2E

---

## Fase 1 — Base de Datos
**Objetivo:** Modelo de datos completo, normalizado y versionado antes de escribir lógica de negocio.
**Semanas:** 1–2
**Dependencia:** Fase 0 completada.
**Estado:** ✅ Completada — 7 / 7 tareas completadas

- [x] Tipos ENUM de PostgreSQL definidos ✅ 2026-08-02
- [x] Script SQL completo (`database/schema.sql`) ✅ 2026-08-02
- [x] Migraciones TypeORM para todas las tablas ✅ 2026-08-02
- [x] Índices de rendimiento aplicados desde el inicio ✅ 2026-08-02
- [x] Seeds: roles, motivos, configuración inicial, municipio, usuario admin temporal ✅ 2026-08-02
- [x] Entidades TypeORM con relaciones ✅ 2026-08-02
- [x] Diagrama entidad-relación generado (`docs/ER_DIAGRAM.md`) ✅ 2026-08-02

### Pendientes de Diseño — Fase 1

- [x] **[AUDITORÍA M-04]** ✅ Resuelto 2026-08-02 — Tabla `ciudadanos` separada con FK en `solicitudes`.
  Implementado en `CiudadanoEntity` y `SolicitudEntity`.

- [x] **[AUDITORÍA M-03]** ✅ Resuelto 2026-08-02 — Campo `historial_contrasenas JSONB DEFAULT '[]'`
  en tabla `usuarios` (no tabla separada). Implementado en `UsuarioEntity`.

---

## Fase 2 — Autenticación y Seguridad
**Objetivo:** Sistema de identidad blindado antes de cualquier módulo funcional.
**Semanas:** 2–3
**Dependencia:** Fase 1 completada.
**Estado:** ✅ Completada — 19 / 19 tareas completadas

- [x] Migración TypeORM para tabla `configuracion_institucional` ✅ 2026-08-03
- [x] Seed inicial de `configuracion_institucional` (configurable vía `.env`) ✅ 2026-08-03
- [x] Variables de entorno `SEED_CI_*` en `.env.example` ✅ 2026-08-03
- [x] Módulo NestJS `configuracion-institucional/` con arquitectura hexagonal ✅ 2026-08-03
- [x] `POST /api/v1/auth/login` con JWT Access + Refresh Token ✅ 2026-08-03
- [x] `POST /api/v1/auth/logout` (revocación de refresh token) ✅ 2026-08-03
- [x] `POST /api/v1/auth/refresh` (rotación de refresh token) ✅ 2026-08-03
- [x] `POST /api/v1/auth/recuperar-contrasena` — rate limit 3/hora, token SHA256, respuesta genérica ✅ 2026-08-04 (B8)
- [x] `POST /api/v1/auth/restablecer-contrasena` — token uso único, historial 5 contraseñas ✅ 2026-08-04 (B8)
- [x] `POST /api/v1/auth/cambiar-contrasena` — valida actual, revoca refresh tokens ✅ 2026-08-04 (B8)
- [x] `GET  /api/v1/auth/me` — perfil completo sin campos sensibles ✅ 2026-08-04 (B8)
- [x] JwtAuthGuard y RolesGuard implementados y aplicados ✅ 2026-08-03
- [x] Rate limiting en `/auth/login` (5 intentos / 15 min por IP) ✅ 2026-08-03
- [x] Bloqueo temporal de cuenta por intentos fallidos (en LocalStrategy) ✅ 2026-08-03
- [x] Política de contraseñas aplicada en DTOs (RN-51) — `@IsStrongPassword()` compartido ✅ 2026-08-04 (B8)
- [x] Registro de auditoría: login, logout, login fallido ✅ 2026-08-03
- [x] Global Exception Filter (sin exposición de internos) ✅ 2026-08-04 (B8 — ya en main.ts)
- [x] Helmet + CORS configurados ✅ 2026-08-04 (B8 — ya en main.ts)
- [x] CRUD Usuarios (Admin): listar, detalle, crear, actualizar, activar/desactivar, soft delete, restaurar ✅ 2026-08-04 (B8)

> **Nota:** El módulo `configuracion-institucional` comparte Fase 2 con Auth porque la tabla debe existir antes de la Fase 4 (generación de PDF). Las pantallas de UI del administrador se implementan en Fase 7.

### Pendientes de Diseño — Fase 2

- [~] **[AUDITORÍA M-02]** Definir flujo completo de desbloqueo de cuenta por intentos fallidos.
  `SECURITY.md` establece: 5 intentos → bloqueo 30 minutos. Sin embargo, no está documentado si
  el desbloqueo es (a) automático al transcurrir 30 min, (b) manual por el Administrador, o (c) ambos.
  Decisión afecta: tabla `usuarios` (columnas `intentos_fallidos`, `bloqueado_hasta`), endpoint de
  desbloqueo manual en panel admin, y CU-43 pendiente en `CASOS_USO.md`.
  _Referencia: `docs/AUDITORIA_DOCUMENTACION.md` §5 (CUF-02)_

---

## Fase 3 — Módulo de Solicitudes (Backend)
**Objetivo:** Núcleo del negocio implementado y probado.
**Semanas:** 3–4
**Dependencia:** Fase 2 completada.
**Estado:** ✅ Completada — 16 / 16 tareas completadas

- [x] `POST /api/v1/public/solicitudes` — Crear solicitud con ciudadano y moto embebidos ✅ 2026-08-03
- [x] `GET  /api/v1/public/solicitudes/estado` — Consulta por radicado + documento ✅ 2026-08-04
- [x] `POST /api/v1/public/solicitudes/{id}/documentos` — Adjuntar documentos (multipart) ✅ 2026-08-04 (B9)
- [x] `GET  /api/v1/solicitudes` — Listar con filtros y paginación (Funcionario) ✅ 2026-08-04
- [x] `GET  /api/v1/solicitudes/{id}` — Detalle completo (Funcionario) ✅ 2026-08-04
- [x] `GET  /api/v1/solicitudes/{id}/documentos/{docId}` — URL firmada descarga (TTL 5 min, RN-53) ✅ 2026-08-04 (B9)
- [x] `POST /api/v1/solicitudes/{id}/aprobar` — Aprobación con generación de permiso en cola ✅ 2026-08-04
- [x] `POST /api/v1/solicitudes/{id}/rechazar` — Rechazo con motivo obligatorio ✅ 2026-08-04
- [x] `POST /api/v1/solicitudes/{id}/correccion` — Solicitar corrección con campos específicos ✅ 2026-08-04
- [x] `GET  /api/v1/solicitudes/{id}/historial` — Historial de estados ✅ 2026-08-04
- [x] Validación: no duplicar solicitudes activas para la misma moto ✅ 2026-08-03
- [x] Número de radicado con formato `AAAAMMDD-PYP-XXXXXX` ✅ 2026-08-03
- [x] Job automático: marcar solicitudes en `VENCIDA` al superar plazo (VencerSolicitudesJob, RN-08) ✅ 2026-08-04 (B9)
- [x] Registro en `historial_estados` en cada cambio ✅ 2026-08-04
- [x] Registro en `auditoria` en cada cambio ✅ 2026-08-04
- [x] StorageModule con MinIO (@Global): subida multipart y URLs firmadas ✅ 2026-08-04 (B9)

### Pendientes de Diseño — Fase 3

- [~] **[AUDITORÍA M-01]** Clarificar el flujo de adjuntar documentos y el estado transitorio
  de la solicitud recién creada.
  Pregunta: ¿La solicitud pasa a estado `recibida` en el momento de su creación (con o sin
  documentos adjuntos), o solo cuando los documentos han sido adjuntados exitosamente?
  Opciones:
  - (a) Estado `recibida` se asigna al hacer `POST /solicitudes` — documentos son opcionales o
    se adjuntan después sin cambio de estado.
  - (b) Estado `borrador` (nuevo) entre la creación y el primer adjunto — la solicitud pasa a
    `recibida` solo cuando el ciudadano confirma el envío con documentos.
  Decisión afecta: ENUM `estado_solicitud`, lógica de transición, UI del stepper en Fase 5,
  y RN-01 en `REGLAS_NEGOCIO.md`.
  _Referencia: `docs/AUDITORIA_DOCUMENTACION.md` §8.2_

---

## Fase 4 — Generación de Permiso (PDF + QR)
**Objetivo:** El documento oficial generado automáticamente con verificación pública.
**Semanas:** 4–5
**Dependencia:** Fase 3 completada (al menos el endpoint de aprobación).
**Estado:** 🔄 En progreso — 13 / 18 tareas completadas ← (B7 completado 2026-08-04)

- [x] PDFModule: generación de PDF institucional con template ✅ 2026-08-04 (B6)
  - [x] Encabezado con logo/escudo desde configuración ✅ 2026-08-04
  - [x] Número consecutivo formato `2026-PYP-00145` ✅ 2026-08-04
  - [x] Snapshot de datos del ciudadano y moto ✅ 2026-08-04
  - [x] Imagen del QR embebida en el PDF ✅ 2026-08-04
  - [x] Firma del funcionario ✅ 2026-08-04
  - [x] Pie de página institucional ✅ 2026-08-04
- [x] QRModule: SHA256 opaco (RN-05), imagen PNG ✅ 2026-08-04 (B6)
- [x] Almacenamiento seguro del PDF en MinIO (bucket privado) ✅ 2026-08-04 (B6)
- [x] `GET /api/v1/permisos` — listado paginado con filtros ✅ 2026-08-04 (B6)
- [x] `GET /api/v1/permisos/{id}` — detalle sin storageKey ni codigoQr ✅ 2026-08-04 (B6)
- [x] `GET /api/v1/permisos/{id}/pdf` — URL firmada 5 min ✅ 2026-08-04 (B6)
- [x] `GET /api/v1/public/verificar/{codigoQR}` — Validación pública (RN-34) ✅ 2026-08-04 (B7)
- [x] Registro de cada escaneo en `qr_validaciones` (RN-35) ✅ 2026-08-04 (B7)
- [x] `POST /api/v1/permisos/{id}/revocar` — Admin only (RN-37) ✅ 2026-08-04 (B7)
- [x] `PATCH /api/v1/permisos/{id}/condiciones` — Funcionario/Admin (RN-38) ✅ 2026-08-04 (B7)
- [x] Job automático: marcar permisos `VENCIDO` diario 00:01 COT (RN-08) ✅ 2026-08-04 (B7)
- [x] NotificacionesModule: persistencia desacoplada en BD ✅ 2026-08-04 (B7)
- [x] Envío real de correos: BullMQ + SMTP + templates HTML (RN-76, RN-77, RN-78, RN-79) ✅ 2026-08-04 (B10)
  - [x] Correo: solicitud recibida ✅ 2026-08-04 (B10)
  - [x] Correo: solicitud aprobada con enlace al portal ✅ 2026-08-04 (B10)
  - [x] Correo: solicitud rechazada con motivo ✅ 2026-08-04 (B10)
  - [x] Correo: corrección requerida con campos específicos ✅ 2026-08-04 (B10)
  - [x] Correo: solicitud vencida ✅ 2026-08-04 (B10)
  - [x] Correo: permiso revocado ✅ 2026-08-04 (B10)
  - [x] Correo: corrección enviada (interno — funcionario) ✅ 2026-08-04 (B10)

### Pendientes de Diseño — Fase 4

- [~] **[AUDITORÍA M-05]** Definir comportamiento del endpoint `GET /api/v1/permisos/{id}/pdf`
  cuando la generación del PDF aún está en progreso (job BullMQ pendiente o en ejecución).
  Opciones:
  - (a) Retornar `HTTP 202 Accepted` con body `{ estado: "generando", retry_after: 5 }`.
  - (b) Retornar `HTTP 200` con `{ pdf_url: null, estado: "generando" }`.
  - (c) El endpoint de aprobación bloquea hasta que el PDF esté listo (síncrono — no recomendado).
  Decisión afecta: contrato del endpoint en `API_FUNCIONAL.md`, lógica del frontend en Fase 6
  (polling vs. websocket) y el mensaje que ve el Funcionario tras aprobar una solicitud.
  _Referencia: `docs/AUDITORIA_DOCUMENTACION.md` §11 (RA-02)_

---

## Fase 5 — Frontend Portal Ciudadano
**Objetivo:** Interfaz pública accesible para el trámite del ciudadano.
**Semanas:** 5–6
**Dependencia:** Fases 3 y 4 completadas.
**Estado:** 🔄 En progreso — B12 completado (infraestructura base)

### B12 — Infraestructura Base (✅ 2026-08-04)
- [x] Next.js 15 + React 19 + TypeScript configurados ✅ 2026-08-04 (B12)
- [x] TailwindCSS con tema institucional extendido (colores, animaciones, tipografía) ✅ 2026-08-04 (B12)
- [x] shadcn/ui primitivos: Button, Input, Label, Select, Textarea, DatePicker, FileUploader, Loading, Skeleton, Card, Badge, Alert, Modal, Stepper, Table ✅ 2026-08-04 (B12)
- [x] Layout: Navbar responsive, Footer, PageHeader, PortalLayout wrapper ✅ 2026-08-04 (B12)
- [x] API client Axios con interceptores JWT, refresh automático y normalización de errores ✅ 2026-08-04 (B12)
- [x] TanStack Query (QueryProvider, QueryClient con retry inteligente) ✅ 2026-08-04 (B12)
- [x] React Hook Form + Zod (instalados — se usan en siguiente bloque) ✅ 2026-08-04 (B12)
- [x] ToastProvider global con accesibilidad ARIA live region ✅ 2026-08-04 (B12)
- [x] ErrorBoundary con UI de recuperación ✅ 2026-08-04 (B12)
- [x] Skip-to-content y enfoque visible WCAG 2.1 AA ✅ 2026-08-04 (B12)
- [x] Rutas shell: /, /solicitud, /estado, /verificar, /contacto, /ayuda ✅ 2026-08-04 (B12)
- [x] Services: public.service.ts (6 endpoints del portal ciudadano) ✅ 2026-08-04 (B12)
- [x] Hooks: useMotivos, useConfiguracionPublica ✅ 2026-08-04 (B12)
- [x] Variables de entorno tipadas (src/lib/env.ts) ✅ 2026-08-04 (B12)

### B13 — Formulario Ciudadano (✅ 2026-08-04)
- [x] Schemas Zod completos: ciudadanoSchema, motocicletaSchema, motivoBaseSchema, confirmacionSchema, solicitudFormSchema ✅ 2026-08-04 (B13)
- [x] Stepper funcional 5 pasos con Framer Motion AnimatePresence (dirección animada) ✅ 2026-08-04 (B13)
- [x] Paso 1: Datos del ciudadano con validaciones colombianas (celular 3XXXXXXXXX, documento, correo) ✅ 2026-08-04 (B13)
- [x] Paso 2: Motocicleta con validación placa colombiana ABC12D ✅ 2026-08-04 (B13)
- [x] Paso 3: Motivos dinámicos GET /public/motivos, fechas con validación cruzada ✅ 2026-08-04 (B13)
- [x] Paso 4: FileUploader (RN-53) drag & drop, PDF/JPG/PNG, máx 10 MB, 5 archivos ✅ 2026-08-04 (B13)
- [x] Paso 5: Pantalla de resumen completo + checkbox declaración jurada ✅ 2026-08-04 (B13)
- [x] LocalStorage auto-save debounced 500 ms + restauración de borrador con banner de aviso ✅ 2026-08-04 (B13)
- [x] reCAPTCHA v3 con hook useRecaptchaV3, env var NEXT_PUBLIC_RECAPTCHA_SITE_KEY, warning en dev ✅ 2026-08-04 (B13)
- [x] Envío con crearSolicitud() + adjuntarDocumentos(), LoadingOverlay, sin doble submit ✅ 2026-08-04 (B13)
- [x] Pantalla de éxito: radicado prominente, botones copiar/imprimir/consultar/nueva ✅ 2026-08-04 (B13)
- [x] Error handling 400/409/422/500/timeout/offline con mensajes distintos, sin alert() ✅ 2026-08-04 (B13)
- [x] WCAG: aria-label, aria-invalid, aria-live, focus management entre pasos ✅ 2026-08-04 (B13)
- [x] Mobile-first responsive, Navbar/Footer sin romper ✅ 2026-08-04 (B13)
- [x] Página de inicio del portal con información del trámite ✅ 2026-08-04 (B12)

### B14 — Consultas y Validación QR (✅ 2026-08-04)
- [x] /estado: formulario RHF+Zod (radicado + documento), TanStack Query, idle/loading/success/error/offline ✅ 2026-08-04 (B14)
- [x] /estado: SolicitudResultado con badge de estado, info completa, historial, permiso si aplica ✅ 2026-08-04 (B14)
- [x] /estado: botón Descargar PDF si permiso.urlDescarga disponible ✅ 2026-08-04 (B14)
- [x] /verificar: VerificarForm con modos cámara/manual ✅ 2026-08-04 (B14)
- [x] /verificar: QrScanner con @zxing/browser, dynamic import SSR-safe, cleanup de cámara ✅ 2026-08-04 (B14)
- [x] /verificar: PermisoResultado con semáforo verde/rojo/gris, detalles del permiso ✅ 2026-08-04 (B14)
- [x] Skeletons, empty states, error states, retry, offline detection ✅ 2026-08-04 (B14)
- [x] Animaciones Framer Motion en resultados ✅ 2026-08-04 (B14)
- [x] Tipo SolicitudResumenCiudadano extendido: motivoNombre, funcionarioNombre, historial[] ✅ 2026-08-04 (B14)
- [x] Hooks: useEstadoSolicitud, useVerificarPermiso ✅ 2026-08-04 (B14)
- [x] Schemas Zod: estadoConsultaSchema, verificarCodigoSchema ✅ 2026-08-04 (B14)
- [x] WCAG: aria-live, aria-label, role="status", role="region", focus management ✅ 2026-08-04 (B14)
- [x] Dynamic import de QrScanner (SSR-safe, no afecta bundle de otras páginas) ✅ 2026-08-04 (B14)

### Fase 5 — COMPLETADA ✅
Todas las páginas del Portal Ciudadano son funcionales: /, /solicitud, /estado, /verificar, /contacto, /ayuda
- [ ] Aviso de privacidad y autorización Ley 1581
- [ ] Accesibilidad WCAG 2.1 nivel AA (validación con axe)
- [ ] Responsive: móvil, tablet y escritorio

---

## Fase 6 — Frontend Panel Funcionario
**Objetivo:** Herramienta operativa para la gestión diaria de solicitudes.
**Semanas:** 6–7
**Dependencia:** Fases 3 y 4 completadas.
**Estado:** 🔄 En progreso — B15 completado

### B15 — Infraestructura base Portal Funcionario (✅ 2026-08-04)
- [x] /funcionario/login: RHF+Zod, toggle contraseña, manejo JWT, error messages, WCAG ✅ 2026-08-04 (B15)
- [x] AuthProvider con Context API, bootstrap refresh token silencioso, logout ✅ 2026-08-04 (B15)
- [x] Persistencia tokens: sessionStorage por defecto, localStorage con "recordarme" ✅ 2026-08-04 (B15)
- [x] Rotación de refresh tokens: callback en api-client sincroniza storage en cada 401 ✅ 2026-08-04 (B15)
- [x] Middleware Next.js: protección /funcionario/* con cookie _f_session, redirect a login ✅ 2026-08-04 (B15)
- [x] ProtectedRoute: loading skeleton, redirect unauthenticated, acceso denegado por rol ✅ 2026-08-04 (B15)
- [x] PermissionGate: renderizado condicional por rol sin redirigir ✅ 2026-08-04 (B15)
- [x] Sidebar: desktop sticky + mobile drawer + hamburguesa, nav items con badge de pendientes ✅ 2026-08-04 (B15)
- [x] HeaderFunc: breadcrumb, botón refresh, ProfileMenu ✅ 2026-08-04 (B15)
- [x] ProfileMenu: dropdown avatar, info usuario, logout ✅ 2026-08-04 (B15)
- [x] BreadcrumbNav: aria-current, teclado completo ✅ 2026-08-04 (B15)
- [x] Dashboard: 6 KPIs StatCard (colores por tipo), actividad reciente, accesos rápidos ✅ 2026-08-04 (B15)
- [x] funcionario.service.ts: login, logout, refresh, getMe, getDashboardStats, getActividadReciente ✅ 2026-08-04 (B15)
- [x] Hooks: useLogin, useLogout, useProfile, useDashboardStats, useActividadReciente, useRefreshToken ✅ 2026-08-04 (B15)
- [x] Componentes reutilizables: StatCard, DashboardCard, PageContainer, SidebarItem ✅ 2026-08-04 (B15)
- [x] WCAG: aria-current, aria-expanded, aria-haspopup, aria-live, focus management, teclado ✅ 2026-08-04 (B15)
- [x] Layout nested: (panel)/layout.tsx con ProtectedRoute + Sidebar ✅ 2026-08-04 (B15)
- [x] ADR-019: estrategia de almacenamiento de tokens ✅ 2026-08-04 (B15)
- [x] Tailwind content: añadido src/modules/** y src/contexts/** ✅ 2026-08-04 (B15)
- [x] Badge variante 'info' añadida ✅ 2026-08-04 (B15)

### B16 — Cola de Solicitudes y Detalle (✅ 2026-08-04)
- [x] Tipos backend correctos: SolicitudListItem, SolicitudDetalle, DocumentoItem, HistorialEstadoItem, PaginatedSolicitudesResponse, SolicitudesFiltros ✅ 2026-08-04 (B16)
- [x] getSolicitudes(), getSolicitudDetalle(), getDocumentoUrl() en funcionario.service.ts ✅ 2026-08-04 (B16)
- [x] useSolicitudes() + useSolicitudesFiltros() con sync URL ✅ 2026-08-04 (B16)
- [x] useSolicitudDetalle(), useDocumentoUrl() — TanStack Query v5 ✅ 2026-08-04 (B16)
- [x] SolicitudStatusBadge — todos los estados con variantes de color ✅ 2026-08-04 (B16)
- [x] SolicitudesTable — sticky header, aria-sort, skeletons, sorting, empty/error states ✅ 2026-08-04 (B16)
- [x] SolicitudFilters — chips multi-selección, búsqueda debounced, rango fechas, orden ✅ 2026-08-04 (B16)
- [x] SearchToolbar — debounce configurable, limpiar, aria-label ✅ 2026-08-04 (B16)
- [x] Pagination — primera/prev/next/última, conteo total ✅ 2026-08-04 (B16)
- [x] EmptyResults — empty state reutilizable con botón reset ✅ 2026-08-04 (B16)
- [x] SolicitudTimeline — historial visual con camposCorreccion expandidos ✅ 2026-08-04 (B16)
- [x] DocumentoViewer — URL firmada on-demand, preview PDF/imagen, descarga ✅ 2026-08-04 (B16)
- [x] DetalleCard — tarjeta reutilizable dl/dt/dd, columnas configurables ✅ 2026-08-04 (B16)
- [x] ConfirmationModal — WCAG focus trap, Escape, overlay, variante danger ✅ 2026-08-04 (B16)
- [x] SolicitudesView — módulo lista con Suspense + filtros + tabla + paginación ✅ 2026-08-04 (B16)
- [x] SolicitudDetalleView — ciudadano, moto, motivo, documentos, historial, modales acción ✅ 2026-08-04 (B16)
- [x] /funcionario/solicitudes page ✅ 2026-08-04 (B16)
- [x] /funcionario/solicitudes/[id] page ✅ 2026-08-04 (B16)
- [x] Fix bugs B15: tipos, parámetros API, countSolicitudes, getActividadReciente ✅ 2026-08-04 (B16)
- [x] HeaderFunc: prop extra (backward compatible) ✅ 2026-08-04 (B16)
- [x] ADR-020: corrección tipos frontend-backend ✅ 2026-08-04 (B16)
- [x] WCAG: aria-sort, aria-busy, aria-live, aria-label, aria-modal, focus trap ✅ 2026-08-04 (B16)

### B17 — Acciones operativas: Aprobar, Rechazar, Corrección (✅ 2026-08-04)
- [x] AccionSolicitudResponse + PermisoPdfUrl types en funcionario.ts ✅ 2026-08-04 (B17)
- [x] aprobarSolicitud(), rechazarSolicitud(), solicitarCorreccion(), getPermisoPdfUrl() en service ✅ 2026-08-04 (B17)
- [x] Zod schemas: rechazarSchema (min20/max1000), correccionSchema (motivo+camposCorreccion) ✅ 2026-08-04 (B17)
- [x] useAprobarSolicitud, useRechazarSolicitud, useSolicitarCorreccion — useMutation + cache invalidation ✅ 2026-08-04 (B17)
- [x] usePermisoPdf — URL firmada PDF on-demand con staleTime 4 min ✅ 2026-08-04 (B17)
- [x] Invalidación automática: SOLICITUDES_KEY + SOLICITUD_DETALLE_KEY + DASHBOARD_STATS_KEY + ACTIVIDAD_KEY ✅ 2026-08-04 (B17)
- [x] Modal Aprobar: onConfirm real + isConfirming + error inline + toast success/error ✅ 2026-08-04 (B17)
- [x] Modal Rechazar: RHF+Zod, motivo min20/max1000, contador caracteres, aria-live ✅ 2026-08-04 (B17)
- [x] Modal Corrección: RHF+Zod, useFieldArray, checkboxes con descripción por campo, motivo general ✅ 2026-08-04 (B17)
- [x] Vista previa (preview step) antes de enviar corrección con cancelar → volver a editar ✅ 2026-08-04 (B17)
- [x] ConfirmationModal: nuevos props onCancel, confirmDisabled, maxWidth ✅ 2026-08-04 (B17)
- [x] Botón Obtener/Descargar PDF cuando solicitud.permiso está presente ✅ 2026-08-04 (B17)
- [x] Mensajes de error de negocio: 409 overlap, 422 estado inválido ✅ 2026-08-04 (B17)
- [x] WCAG: aria-required, aria-busy, aria-live, aria-describedby, role=alert ✅ 2026-08-04 (B17)
- [x] ADR-021: patrón preview-step para Corrección modal ✅ 2026-08-04 (B17)

---

## Fase 7 — Frontend Panel Administrador
**Objetivo:** Control total del sistema desde la interfaz.
**Semanas:** 7–8
**Dependencia:** Fase 6 completada.
**Estado:** ⬜ No iniciada

- [ ] Pantalla "Configuración Institucional" (CU-42 a CU-45):
  - [ ] Vista de consulta con previsualización de escudo y logo (HU-44)
  - [ ] Formulario de edición de datos textuales (HU-45)
  - [ ] Carga/reemplazo del escudo con validación de formato y tamaño (HU-46)
  - [ ] Carga/reemplazo del logo con opción de eliminar (HU-47)
- [ ] Dashboard administrativo con KPIs globales
- [ ] CRUD de Usuarios (crear funcionarios, activar/desactivar)
- [ ] CRUD de Roles
- [ ] CRUD de Dependencias
- [ ] CRUD de Motivos (con activación/desactivación sin borrar)
- [ ] Configuración del Sistema (Parámetros Operativos):
  - [ ] Firma digital configurable (upload de imagen)
  - [ ] Sello institucional (upload de imagen)
  - [ ] Parámetros: días máximos permiso, plazos, color institucional
- [ ] Vista de auditoría filtrable (usuario, acción, fecha, entidad)
- [ ] Gestión de permisos: listar, revocar con motivo
- [ ] Reportes:
  - [ ] Solicitudes por fecha, estado, funcionario
  - [ ] Motivos más frecuentes
  - [ ] Permisos vigentes y vencidos
  - [ ] Exportar: Excel, PDF, CSV

---

## Fase 8 — Calidad y Producción
**Objetivo:** Sistema listo para operar en producción con garantías de calidad.
**Semanas:** 8–10
**Dependencia:** Fases 5, 6 y 7 completadas.
**Estado:** ⬜ No iniciada

- [ ] Pruebas unitarias backend (cobertura ≥ 80%)
  - [ ] Use cases críticos
  - [ ] Guards y validaciones
  - [ ] Servicios de dominio
- [ ] Pruebas de integración (flujos críticos end-to-end en backend)
  - [ ] Flujo completo: crear solicitud → aprobar → generar PDF → validar QR
  - [ ] Flujo de rechazo y notificación
  - [ ] Flujo de corrección y reenvío
- [ ] Pruebas E2E del portal ciudadano (Playwright o Cypress)
- [ ] Optimización de consultas BD (EXPLAIN ANALYZE en queries críticos)
- [ ] Docker para producción (multi-stage builds)
- [ ] `docker-compose.prod.yml` con Nginx + SSL
- [ ] Configuración de CI/CD (GitHub Actions)
- [ ] Manual Técnico (`docs/MANUAL_TECNICO.md`) — ✅ ya generado
- [ ] Manual de Usuario (`docs/MANUAL_USUARIO.md`) — ✅ ya generado
- [ ] Guía de despliegue en producción (`docs/PLAN_DESPLIEGUE.md`) — ✅ ya generado
- [ ] Datos de prueba para entorno de demo
- [ ] Revisión de seguridad final (checklist `SECURITY.md`)

---

## Estado Actual

### Fase Activa

Fase 4 — Generación de Permiso (PDF + QR) ← ✅ COMPLETADA — 18/18 tareas
Fase 5 — Frontend Portal Ciudadano ← Siguiente fase (no iniciada)

### Tareas pendientes

Todas las tareas de Backend (Fases 0–4) están completadas.
El próximo desarrollo es Frontend (Fases 5, 6, 7) o Fase 8 (calidad y producción).

### Última tarea terminada

B11.1 — Cierre de Infraestructura de Producción (2026-08-04):
- docker/nginx/nginx.conf creado: gzip, proxy_buffering, keepalive, rate limiting Nginx, headers de seguridad completos (X-Frame-Options, X-Content-Type-Options, CSP, Permissions-Policy, COEP), HSTS listo (comentado hasta confirmar SSL), WebSocket upgrade, manejo de errores 404/500 en JSON, TLS 1.2/1.3 Mozilla Modern
- docker/nginx/ssl/.gitkeep: directorio versionado, certificados excluidos
- .gitignore: +.env.production, +.env.staging, +docker/.env.production, +docker/nginx/ssl/*.pem/*.crt/*.key (hallazgo crítico — no estaba cubierto)
- backend/Dockerfile mejorado: stage 'deps' separado para prod deps / stage 'build' para dev+compilación / HEALTHCHECK integrado / no duplicación de npm prune
- frontend/Dockerfile mejorado: mismo patrón deps/build/development/production + HEALTHCHECK
- ConfiguracionInstitucionalSeeder (OnApplicationBootstrap): inserta registro inicial desde SEED_CI_* vars si la tabla está vacía — hallazgo crítico: SEED_CI vars existían en env pero no había código que las leyera
- configuration.ts: +seed.ci.* namespace completo
- validation.schema.ts: +SEED_CI_* como opcionales con tipos correctos
- configuracion-institucional.module.ts: +ConfiguracionInstitucionalSeeder como provider
- .env.example y .env.production.example: +SEED_CI_NIT, +SEED_CI_CODIGO_DANE
- docker-compose.prod.yml: +SEED_CI_NIT, +SEED_CI_CODIGO_DANE en environment del backend
- README_DEPLOY.md: +sección SSL (Let's Encrypt + institucional), +checklist pre-producción (12 items), +checklist post-despliegue (10 items), índice renumerado

B11 — Hardening del Backend + Preparación para Producción (2026-08-04):
- Health checks completos: GET /api/v1/health verifica DB + Redis + MinIO + SMTP (Terminus)
- RedisHealthIndicator, MinioHealthIndicator, SmtpHealthIndicator (TCP probe sin dependencia HTTP)
- ThrottlerModule movido a AppModule como guard global (100 req/min por IP)
- Mailpit agregado a docker-compose.yml (captura de correos en desarrollo, UI en :8025)
- docker-compose.prod.yml creado: Nginx proxy, redes internas aisladas, restart:always, volúmenes
- .env.production.example con todos los secretos, instrucciones de generación y reglas críticas
- README_DEPLOY.md: guía completa de despliegue, migraciones, backup, rollback, troubleshooting
- MinioStorageAdapter.ping() expuesto para health check sin acoplamiento
- Variables SEED_CI_* y Mailpit agregadas al .env.example existente
- ROADMAP.md corregido: Fase 4 actualizada de 13/18 a 18/18

B10 — Sistema de Notificaciones Reales (BullMQ + SMTP) (2026-08-04):
- RedisModule (@Global) reutilizable — IORedis singleton
- BullModule.forRootAsync en AppModule — configuración única centralizada
- EmailModule con abstracción IEmailProvider (EMAIL_PROVIDER token)
- SmtpEmailProvider (Nodemailer) — transporte SMTP con pool de conexiones
- PlantillaEmailService — templates HTML + branding institucional desde DB + caché 60s
- 7 templates HTML institucionales (solicitud-recibida, solicitud-aprobada, solicitud-rechazada, correccion-requerida, solicitud-vencida, permiso-revocado, correccion-enviada)
- EmailProcessor (BullMQ WorkerHost) — concurrencia 5, backoff 1m/5m/15m, DLQ
- NotificacionesService actualizado — encola en BullMQ después de persistir en DB
- Integración en 5 use-cases: CrearSolicitud, AprobarSolicitud, RechazarSolicitud, SolicitarCorreccion + VencerSolicitudesJob
- Migración `AddContextoToNotificaciones` — columna JSONB para snapshot de contexto
- TipoNotificacion: +SOLICITUD_VENCIDA, +CORRECCION_ENVIADA
- **Fase 4 cerrada: 18/18 tareas completadas ✅**

### Próxima tarea

B11 — Frontend Portal Ciudadano (Fase 5) o B11 — Calidad y Producción (Fase 8). Requiere autorización.

---

## Reglas para Claude

- Trabajar una tarea a la vez.
- No avanzar a la siguiente Fase sin completar la actual, salvo que el usuario lo indique.
- Resolver todos los `[~]` Pendientes de Diseño de una fase antes de iniciar su implementación.
- Al finalizar una tarea:
  - Marcarla como `[x]` completada en este archivo.
  - Actualizar el porcentaje de progreso en `ROADMAP.md`.
  - Documentar los cambios realizados.
- Nunca eliminar tareas del historial.
