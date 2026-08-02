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
- [ ] Frontend Next.js: scaffolding base con App Router y TailwindCSS
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
**Estado:** 🔵 En progreso — 3 / 7 tareas completadas

- [x] Tipos ENUM de PostgreSQL definidos ✅ 2026-08-02
- [x] Script SQL completo (`database/schema.sql`) ✅ 2026-08-02
- [ ] Migraciones TypeORM para todas las tablas
- [ ] Índices de rendimiento aplicados desde el inicio
- [ ] Seeds: roles, motivos, configuración inicial, municipio, usuario admin temporal
- [x] Entidades TypeORM con relaciones ✅ 2026-08-02
- [ ] Diagrama entidad-relación generado (`docs/ER_DIAGRAM.md`)

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
**Estado:** ⬜ No iniciada

- [ ] `POST /api/v1/auth/login` con JWT Access + Refresh Token
- [ ] `POST /api/v1/auth/logout` (revocación de refresh token)
- [ ] `POST /api/v1/auth/refresh` (rotación de refresh token)
- [ ] `POST /api/v1/auth/recuperar-contrasena`
- [ ] `POST /api/v1/auth/restablecer-contrasena`
- [ ] `POST /api/v1/auth/cambiar-contrasena`
- [ ] `GET  /api/v1/auth/me`
- [ ] JwtAuthGuard y RolesGuard globales
- [ ] Rate limiting en `/auth/login` (5 intentos / 15 min por IP)
- [ ] Bloqueo temporal de cuenta por intentos fallidos
- [ ] Política de contraseñas aplicada en DTOs
- [ ] Registro de auditoría: login, logout, login fallido, cambio de contraseña
- [ ] Global Exception Filter (sin exposición de internos)
- [ ] Helmet + CORS configurados
- [ ] CRUD Usuarios (Admin): crear, listar, activar/desactivar, soft delete

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
**Estado:** ⬜ No iniciada

- [ ] `POST /api/v1/public/solicitudes` — Crear solicitud con ciudadano y moto embebidos
- [ ] `GET  /api/v1/public/solicitudes/estado` — Consulta por radicado + documento
- [ ] `POST /api/v1/solicitudes/{id}/documentos` — Adjuntar documentos (URLs firmadas)
- [ ] `GET  /api/v1/solicitudes` — Listar con filtros y paginación (Funcionario)
- [ ] `GET  /api/v1/solicitudes/{id}` — Detalle completo (Funcionario)
- [ ] `GET  /api/v1/solicitudes/{id}/documentos/{docId}` — URL firmada descarga
- [ ] `POST /api/v1/solicitudes/{id}/aprobar` — Aprobación con generación de permiso en cola
- [ ] `POST /api/v1/solicitudes/{id}/rechazar` — Rechazo con motivo obligatorio
- [ ] `POST /api/v1/solicitudes/{id}/correccion` — Solicitar corrección con campos específicos
- [ ] `GET  /api/v1/solicitudes/{id}/historial` — Historial de estados
- [ ] Validación: no duplicar solicitudes activas para la misma moto
- [ ] Número de radicado con formato `AAAAMMDD-PYP-XXXXXX`
- [ ] Job automático: marcar solicitudes en `VENCIDA` al superar plazo
- [ ] Registro en `historial_estados` en cada cambio
- [ ] Registro en `auditoria` en cada cambio
- [ ] StorageModule con MinIO: subida y URLs firmadas

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
**Estado:** ⬜ No iniciada

- [ ] PDFModule: generación de PDF institucional con template
  - [ ] Encabezado con logo/escudo desde configuración
  - [ ] Número consecutivo formato `2026-PYP-00145`
  - [ ] Snapshot de datos del ciudadano y moto
  - [ ] Imagen del QR embebida en el PDF
  - [ ] Firma y sello institucional configurables
  - [ ] Pie de página institucional
- [ ] QRModule: generación de código QR con identificador UUID+hash opaco
- [ ] Almacenamiento seguro del PDF en MinIO (bucket privado)
- [ ] `GET /api/v1/permisos/{id}/pdf` — URL firmada para descarga
- [ ] `GET /api/v1/public/verificar/{codigoQR}` — Validación pública del QR
- [ ] Registro de cada escaneo en `qr_validaciones`
- [ ] `POST /api/v1/permisos/{id}/revocar` — Revocación con motivo (Admin)
- [ ] Job automático: marcar permisos en `VENCIDO` al superar `fecha_vencimiento`
- [ ] NotificacionesModule: cola de correos con BullMQ
  - [ ] Correo: solicitud recibida (con número de radicado)
  - [ ] Correo: solicitud aprobada (con enlace de descarga)
  - [ ] Correo: solicitud rechazada (con motivo)
  - [ ] Correo: solicitud requiere corrección (con campos específicos)

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
**Estado:** ⬜ No iniciada

- [ ] Página de inicio del portal con información del trámite
- [ ] Formulario de solicitud en pasos (stepper):
  - [ ] Paso 1: Datos personales del ciudadano
  - [ ] Paso 2: Datos de la motocicleta
  - [ ] Paso 3: Motivo y fechas
  - [ ] Paso 4: Carga de documentos adjuntos
  - [ ] Paso 5: Declaración y confirmación
- [ ] Guardado automático en localStorage (prevenir pérdida de datos)
- [ ] Validación en tiempo real (placa, documento, correo, fechas)
- [ ] reCAPTCHA v3 integrado
- [ ] Pantalla de confirmación con número de radicado prominente
- [ ] Página de consulta de estado (radicado + documento)
- [ ] Página de descarga del permiso aprobado
- [ ] Página pública de validación QR (optimizada para móvil)
  - [ ] Estado visual claro: verde (Vigente), rojo (Vencido/Revocado), gris (No encontrado)
- [ ] Aviso de privacidad y autorización Ley 1581
- [ ] Accesibilidad WCAG 2.1 nivel AA
- [ ] Responsive: móvil, tablet y escritorio

---

## Fase 6 — Frontend Panel Funcionario
**Objetivo:** Herramienta operativa para la gestión diaria de solicitudes.
**Semanas:** 6–7
**Dependencia:** Fases 3 y 4 completadas.
**Estado:** ⬜ No iniciada

- [ ] Pantalla de login con manejo de sesión JWT
- [ ] Dashboard: KPIs del día (recibidas, pendientes, aprobadas, rechazadas, vencidas)
- [ ] Cola de solicitudes ordenada por antigüedad con indicadores de urgencia
- [ ] Filtros: estado, fecha, documento, placa, radicado
- [ ] Vista de detalle de solicitud:
  - [ ] Todos los datos personales y de la moto
  - [ ] Previsualización de documentos adjuntos (PDF e imagen inline)
  - [ ] Historial de estados
- [ ] Modal de aprobación con resumen y confirmación
- [ ] Modal de rechazo con motivo obligatorio
- [ ] Modal de corrección con selección de campos a corregir
- [ ] Visualización y descarga del permiso generado
- [ ] Botón de impresión del PDF

---

## Fase 7 — Frontend Panel Administrador
**Objetivo:** Control total del sistema desde la interfaz.
**Semanas:** 7–8
**Dependencia:** Fase 6 completada.
**Estado:** ⬜ No iniciada

- [ ] Dashboard administrativo con KPIs globales
- [ ] CRUD de Usuarios (crear funcionarios, activar/desactivar)
- [ ] CRUD de Roles
- [ ] CRUD de Dependencias
- [ ] CRUD de Motivos (con activación/desactivación sin borrar)
- [ ] Configuración del sistema:
  - [ ] Nombre de la alcaldía, municipio
  - [ ] Logo / escudo (upload de imagen)
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

Fase 0 — Fundamentos

### Tareas pendientes en la fase activa

Ninguna. Fase 0 completada (12/12).

### Última tarea terminada

Frontend Next.js scaffolding (2026-08-02):
`frontend/` con Next.js 14, App Router, TailwindCSS 3, TypeScript estricto.
`src/app/` con layout.tsx, page.tsx, not-found.tsx, error.tsx.
`src/lib/` con api-client.ts y constants.ts.
`src/types/index.ts` con contratos de ApiResponse.
`frontend/Dockerfile` multi-stage (development/build/production).
Servicio `frontend` agregado a docker-compose.yml.
lint-staged actualizado para cubrir archivos del frontend.

### Próxima tarea

Fase 1 — Base de Datos (resolver primero los [~] M-04 y M-03) — aguardando autorización.

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
