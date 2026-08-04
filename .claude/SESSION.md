# SESSION.md

# Estado de la Sesión del Proyecto

Este documento mantiene el estado actual del desarrollo para permitir la continuidad entre sesiones.

---

## Fase actual

Fase: Fase 4 ✅ COMPLETADA — 18/18 tareas

Bloque actual: B10 ✅ COMPLETADO — BullMQ worker + SMTP Nodemailer + RedisModule + EmailModule + 7 templates HTML + integración con use-cases

Rama: `feature/fase-2-auth`

Estado: Fase 3: 16/16 ✅. Fase 4: 18/18 ✅. Backend completo. Siguiente: Fase 5 (Frontend Ciudadano) o Fase 8 (Calidad).

---

## Fase anterior

Fase: Fase 2 — Autenticación y Seguridad

Estado: ✅ COMPLETADA (parcial) — Login/Logout/Refresh implementados. Pendientes: recuperar/restablecer/cambiar contraseña, GET /me, CRUD Usuarios.

---

## Tareas completadas

### Fase 0 (cerrada)
✓ Repositorio Git + GitFlow (main, develop, feature/*, hotfix/*)
✓ `.gitignore` completo (Node, env, build)
✓ Backend NestJS: scaffolding base con ConfigModule tipado
✓ Archivo `.env.example` completo con todas las variables
✓ ESLint + Prettier configurados
✓ Swagger configurado y accesible en `/api/docs`
✓ Endpoint `/api/v1/health` operativo
✓ Logger estructurado (Pino) configurado
✓ README.md con instrucciones de setup local
✓ Docker Compose: PostgreSQL 15 + Redis 7 + MinIO + Backend NestJS + Frontend Next.js
✓ Husky: pre-commit hooks (lint-staged + commitlint)
✓ Frontend Next.js: scaffolding base con App Router y TailwindCSS

### Fase 1 (en progreso)
✓ **ENUMs TypeORM** — 11 archivos en `backend/src/common/enums/`: 5 tipos PostgreSQL nativos
  (`EstadoSolicitud`, `EstadoPermiso`, `TipoDocumentoAdjunto`, `TipoConfig`, `AccionAuditoria`) +
  5 VARCHAR TypeScript-only + barrel `index.ts`. ✅ 2026-08-02
✓ **Entidades TypeORM** — 16 archivos en `backend/src/modules/**/infrastructure/persistence/`:
  `RoleEntity`, `MunicipioEntity`, `DependenciaEntity`, `UsuarioEntity`, `TokenEntity`,
  `CiudadanoEntity`, `MotocicletaEntity`, `MotivoEntity`, `SolicitudEntity`,
  `HistorialEstadoEntity`, `DocumentoEntity`, `PermisoEntity`, `QrValidacionEntity`,
  `NotificacionEntity`, `AuditoriaRegistroEntity`, `ConfiguracionEntity`. ✅ 2026-08-02
✓ **M-04 resuelto** — tabla `ciudadanos` separada con FK en `solicitudes`. ✅ 2026-08-02
✓ **M-03 resuelto** — `historial_contrasenas JSONB DEFAULT '[]'` en `usuarios`. ✅ 2026-08-02
✓ **Quality Gate** — `tsc --noEmit` (backend + frontend) exit 0, `nest build` exit 0. ✅ 2026-08-02
✓ **Script SQL completo** — `database/schema.sql` (5 ENUMs, 1 secuencia, 16 tablas, 30 FKs,
  11 CHECKs, 27 índices regulares, 4 índices parciales, 1 índice único parcial). ✅ 2026-08-02
  Inconsistencias detectadas y documentadas (INC-001, INC-002, INC-003) — no bloqueantes.
✓ **Reconciliación del modelo** — Entidades ORM sincronizadas con MODELO_DATOS.md. ✅ 2026-08-02
  INC-001: `hashPdf: string | null` agregado a `PermisoEntity`.
  INC-002: índice `token_hash` renombrado a `idx_tokens_token_hash` y eliminada propiedad `unique`.
  INC-003: índice compuesto renombrado a `idx_tokens_usuario_tipo_revocado` en `TokenEntity`.
  Los cuatro artefactos (MODELO_DATOS.md, entidades, migraciones, schema.sql) quedan sincronizados.
✓ **Migración inicial TypeORM** — `backend/database/migrations/1785628800000-InitialSchema.ts` ✅ 2026-08-02
  Implementa `up()`: 5 ENUMs, 1 secuencia, 16 tablas, 5 FK circulares via ALTER TABLE, 27 índices regulares,
  4 índices parciales, 1 índice único parcial. Implementa `down()` en orden inverso con drop correcto de
  FK circulares antes de drop de tablas. Reproducción exacta de `database/schema.sql`.

---

## Tareas pendientes — Fase 1

✅ TODAS LAS TAREAS COMPLETADAS (7/7)

---

## Próxima tarea sugerida

B11 — Frontend Portal Ciudadano (Fase 5) o Fase 8 (Calidad y Producción). Requiere autorización.

---

## Política — Framework del Proyecto Congelado

> **Vigente desde:** 2026-08-02
>
> A partir de este momento el framework del proyecto está congelado.
>
> No deberán proponerse modificaciones a la metodología, herramientas de desarrollo,
> flujo Git, documentación base o estándares del proyecto, salvo que exista:
>
> - un **bloqueo crítico** que impida continuar el desarrollo funcional,
> - una **vulnerabilidad crítica** (CVSS ≥ 9.0) que requiera acción inmediata, o
> - una **decisión arquitectónica aprobada** mediante un nuevo ADR registrado en DECISION_LOG.md.
>
> Las fases 1 a 8 deberán enfocarse exclusivamente en el desarrollo funcional del sistema.

---

## Observaciones

- PR #2 mergeado a `develop` el 2026-08-02 (merge commit `33d6990`).
- Rama `feature/fase-0-backend-nestjs` eliminada (remota y local).
- Rama activa actual: `develop`.
- M-04 ✅ Resuelto — tabla `ciudadanos` separada con FK en `solicitudes`.
- M-03 ✅ Resuelto — campo `historial_contrasenas JSONB DEFAULT '[]'` en tabla `usuarios`.
- Hallazgos técnicos diferidos a Fase 1:
  - HAL-001: `baseUrl` deprecated en `backend/tsconfig.json` (TS5102)
  - HAL-002: Next.js 14 → 15 (5 CVEs altas, 0 críticas)
  - HAL-003: NestJS 28 vulns (0 críticas) — evaluación NestJS v11 en Fase 8
  - HAL-004: ESLint v9 flat config — migrar `backend/.eslintrc.json` a `eslint.config.js`

---

## Decisiones Técnicas (Fase 0)

- `next.config.ts` no soportado en Next.js 14 (es Next.js 15+) → convertido a `next.config.js`.
- `@typescript-eslint/no-unused-vars` no declarado explícitamente en `.eslintrc.json` del frontend —
  ya viene incluido transitivamente por `eslint-config-next`; declararlo sin el plugin instalado genera error.
- Frontend en lint-staged cubre solo `prettier --write` (Next.js tiene su propio linter con `next lint`).
- `output: 'standalone'` en next.config.js para build optimizado en Docker (copia solo lo necesario).
- Servicio `frontend` en docker-compose depende de `backend` con `condition: service_healthy`.
- Inter desde `next/font/google` — Next.js la descarga en build time y la sirve localmente en runtime (sin petición a Google en producción).

---

✓ **Auditoría y sincronización de índices** — 7 diferencias corregidas en 6 entidades. ✅ 2026-08-02
  D-001: `idx_ciudadanos_numero_doc` eliminado de `CiudadanoEntity` (duplicaba índice único del constraint).
  D-002: `idx_usuarios_email` eliminado de `UsuarioEntity` (duplicaba índice único del constraint).
  D-003: `idx_usuarios_rol_id` agregado a `UsuarioEntity`.
  D-004: `idx_solicitudes_estado_moto` (compuesto) agregado a `SolicitudEntity`.
  D-005: `idx_auditoria_entidad` renombrado a `idx_auditoria_entidad_id` en `AuditoriaRegistroEntity`.
  D-006: `idx_historial_estados_solicitud_id` renombrado a `idx_historial_solicitud_created`.
  D-007: `idx_permisos_funcionario_id` agregado a `PermisoEntity`.
  MODELO_DATOS.md §10 tiene inconsistencia interna en nombre del índice parcial de motocicletas
  (idx_motocicletas_placa_activo/idx_motocicletas_activas vs uq_motocicletas_placa_activa en §11).
  Schema.sql y migración siguen §11. No requiere corrección en código.
  Quality Gate: tsc --noEmit exit 0.

✓ **Corrección documental MODELO_DATOS.md** — inconsistencia de nomenclatura resuelta. ✅ 2026-08-02
  §10 tabla regular: `idx_motocicletas_placa_activo` → `uq_motocicletas_placa_activa (Partial UNIQUE)`.
  §10 tabla parcial: `idx_motocicletas_activas` → `uq_motocicletas_placa_activa`.
  Los cuatro artefactos (MODELO_DATOS.md, entidades ORM, schema.sql, migración) quedan completamente sincronizados en nomenclatura.

✓ **Seeds iniciales** — `backend/database/seeds/seed.ts`. ✅ 2026-08-02
  6 secciones idempotentes (ON CONFLICT DO NOTHING): roles, municipios, dependencias, motivos, configuracion, usuario admin.
  bcryptjs instalado (12 rounds). Script: `npm run seed` desde /backend.
  Variables configurables vía .env (ver .env.example sección Seeds).
  Quality Gate: tsc --noEmit exit 0.

✓ **Diagrama ER** — `docs/ER_DIAGRAM.md` y `docs/ER_DIAGRAM.mmd` ✅ 2026-08-02
  16 entidades · 20 relaciones · 6 módulos lógicos · Mermaid nativo GitHub/Obsidian.
  FK circulares (usuarios ↔ dependencias, self-refs) documentadas en §6.
  Decisiones de diseño D-001 a D-007 documentadas en §8.
  Fase 1 completada: 7/7 tareas.

✓ **Módulo Configuración Institucional incorporado** — documentación completa. 2026-08-02
  Nuevo requerimiento funcional integrado en toda la documentación del proyecto (sin tocar código).
  Nueva entidad `configuracion_institucional` (singleton, tabla, reglas de negocio, API, seguridad).
  Documentos actualizados: PRD, MODELO_DATOS.md, REGLAS_NEGOCIO.md (RN-101 a RN-108),
  HISTORIAS_USUARIO.md (É-09, HU-44 a HU-47), CASOS_USO.md (Módulo 6, CU-42 a CU-45),
  API.md, SECURITY.md, DECISION_LOG.md (ADR-017), TASKS.md, ROADMAP.md.
  Implementación programada: Fase 2 (migración + seed + módulo backend) + Fase 7 (UI admin).

✓ **Auditoría arquitectónica final — módulo Configuración Institucional** ✅ 2026-08-02
  INC-CI-001 resuelto: Fase 7 "Configuración del sistema" renombrada a "Configuración del Sistema
  (Parámetros Operativos)"; eliminados sub-ítems "Nombre de la alcaldía/municipio" y "Logo/escudo"
  que ahora pertenecen a ConfiguracionInstitucionalModule. Aplicado en ROADMAP.md y TASKS.md.
  INC-CI-002 resuelto: ARCHITECTURE.md actualizado — agregado ConfiguracionInstitucionalModule a
  tabla de módulos, IConfiguracionInstitucionalRepository a Driven Ports, y nueva sección
  "Separación de Dominios" con tabla comparativa y regla arquitectónica.
  Auditoría cerrada. Documentación 100% consistente. Listo para inicio de Fase 2.

✓ **Auditoría final completa de Fase 1** ✅ 2026-08-02
  Revisión técnica integral: 16 entidades ✅, 1 migración ✅, schema.sql (28 índices) ✅,
  seeds idempotentes ✅, 11 ENUMs ✅, CHANGELOG v0.2.0 consolidado ✅.
  HAL-001 y HAL-004 evaluados: no bloqueantes para Fase 2, deben resolverse al iniciarla.
  Working tree limpio. Rama sincronizada. Sin conflictos con develop. PR pendiente de creación.
  Release v0.2.0 generada. Documentación congelada activa.

✓ **B5C4 — Aprobación, rechazo y corrección de solicitudes** ✅ 2026-08-04
  Commit: `feat(solicitudes): implementar aprobación y rechazo de solicitudes`
  Rama: `feature/fase-2-auth`
  Archivos nuevos:
  - `domain/services/solicitud-state-machine.ts` — máquina de estados centralizada (RN-15)
  - `application/dtos/rechazar-solicitud.dto.ts` — motivo ≥20 chars (RN-04)
  - `application/dtos/solicitar-correccion.dto.ts` — motivo + camposCorreccion (RN-04, RN-16)
  - `application/dtos/accion-solicitud-response.dto.ts` — respuesta unificada acciones
  - `application/use-cases/aprobar-solicitud.use-case.ts` — RN-15, RN-17, RN-01 (HTTP 202)
  - `application/use-cases/rechazar-solicitud.use-case.ts` — RN-04, RN-10, RN-15 (HTTP 200)
  - `application/use-cases/solicitar-correccion.use-case.ts` — RN-04, RN-15, RN-16 (HTTP 200)
  Archivos modificados:
  - `domain/ports/solicitud-repository.interface.ts` — CambiarEstadoParams + 2 métodos nuevos
  - `infrastructure/persistence/typeorm-solicitud.repository.ts` — cambiarEstado + tienePermisoVigenteConSolapamiento
  - `infrastructure/controllers/solicitudes-funcionario.controller.ts` — 3 endpoints POST
  - `solicitudes.module.ts` — 3 use cases nuevos registrados
  Quality gates: tsc --noEmit ✅, npm run lint ✅ (0 errores), nest build ✅

  Deuda técnica → B6:
  - condicionesRestricciones (RN-38): PATCH /permisos/{id}/condiciones post-aprobación
  - Notificaciones BullMQ: enqueue en aprobar/rechazar/correccion
  - AccionAuditoria.EDITAR usado para auto-transición recibida→en_revision (sin enum propio)

✓ **B6 — PermisosModule: generación de permiso con PDF + QR** ✅ 2026-08-04
  Rama: `feature/fase-2-auth`
  Archivos nuevos (módulo completo):
  - `domain/entities/permiso.domain-entity.ts` — SnapshotCiudadano/Motocicleta/Motivo
  - `domain/ports/permiso-repository.interface.ts` — IPermisoRepository + CrearPermisoParams
  - `infrastructure/services/qr-code.service.ts` — SHA256 opaco + imagen PNG
  - `infrastructure/services/codigo-permiso.service.ts` — nextval PostgreSQL
  - `infrastructure/services/pdf-generator.service.ts` — escarapela A4 con pdfkit
  - `infrastructure/services/minio-storage.adapter.ts` — upload/download/presignedUrl
  - `infrastructure/persistence/permiso.mapper.ts` — entity ↔ domain
  - `infrastructure/persistence/typeorm-permiso.repository.ts` — CRUD + listado paginado
  - `infrastructure/controllers/permisos.controller.ts` — GET /permisos, /:id, /:id/pdf
  - `application/dtos/listar-permisos-query.dto.ts`
  - `application/dtos/permiso-list-item.dto.ts` — PermisoListItemDto + PermisoDetalleDto + PermisoPdfUrlDto + PermisoGeneradoDto
  - `application/use-cases/generar-permiso.use-case.ts` — flujo completo RN-05/06/07/33
  - `application/use-cases/obtener-permiso-por-id.use-case.ts`
  - `application/use-cases/listar-permisos.use-case.ts`
  - `application/use-cases/obtener-pdf-permiso.use-case.ts` — URL firmada 5 min
  - `permisos.module.ts` — exports GenerarPermisoUseCase
  - `database/migrations/1785984000000-AddCondicionesRestriccionesPermiso.ts`
  Archivos modificados:
  - `permisos/infrastructure/persistence/permiso.entity.ts` — + condicionesRestricciones
  - `solicitudes/application/use-cases/aprobar-solicitud.use-case.ts` — llama GenerarPermisoUseCase
  - `solicitudes/solicitudes.module.ts` — importa PermisosModule via forwardRef
  - `app.module.ts` — importa PermisosModule
  - `backend/package.json` — + pdfkit, qrcode, minio, uuid
  Quality gates: tsc --noEmit ✅, npm run lint ✅ (0 errores), nest build ✅

  Deuda técnica → B7:
  - BullMQ: hacer GenerarPermiso verdaderamente asíncrono (actualmente síncrono en aprobar)
  - Notificaciones: correo al ciudadano al aprobar/rechazar
  - condicionesRestricciones: PATCH /permisos/{id}/condiciones
  - Revocación: POST /permisos/{id}/revocar (solo admin)
  - Job automático: vencer permisos (fecha_vencimiento < hoy)
  - Consulta pública QR: GET /public/verificar/{codigoQr}
  - Verificación de integridad escudo al iniciar (seed debe incluir escudo placeholder)

✓ **B7 — Ciclo de vida del permiso completo** ✅ 2026-08-04
  Rama: `feature/fase-2-auth`
  Archivos nuevos:
  - `permisos/application/dtos/revocar-permiso.dto.ts`
  - `permisos/application/dtos/revocar-permiso-response.dto.ts`
  - `permisos/application/dtos/actualizar-condiciones.dto.ts`
  - `permisos/application/dtos/verificar-qr-response.dto.ts`
  - `permisos/application/use-cases/revocar-permiso.use-case.ts` — RN-37, RN-36
  - `permisos/application/use-cases/actualizar-condiciones-permiso.use-case.ts` — RN-38, RN-39
  - `permisos/application/use-cases/verificar-qr.use-case.ts` — RN-34, RN-35
  - `permisos/infrastructure/persistence/qr-validacion.repository.ts`
  - `permisos/infrastructure/controllers/permisos-public.controller.ts` — GET /public/verificar/:qr
  - `permisos/infrastructure/jobs/vencer-permisos.job.ts` — cron 00:01 COT (RN-08)
  - `notificaciones/notificaciones.service.ts` — encolar() desacoplado
  - `notificaciones/notificaciones.module.ts`
  Archivos modificados:
  - `permisos/domain/entities/permiso.domain-entity.ts` — + revocadoPorNombre/Apellido
  - `permisos/domain/ports/permiso-repository.interface.ts` — + revocar, actualizarCondiciones, findByCodigoQr, marcarVencidos
  - `permisos/infrastructure/persistence/typeorm-permiso.repository.ts` — implementa 4 nuevos métodos
  - `permisos/infrastructure/persistence/permiso.mapper.ts` — enriquece revocadoPor
  - `permisos/infrastructure/controllers/permisos.controller.ts` — + POST /revocar, PATCH /condiciones
  - `permisos/permisos.module.ts` — ScheduleModule, QrValidacionEntity, NotificacionesModule, 4 nuevos providers
  - `common/enums/accion-auditoria.enum.ts` — + EDITAR_CONDICIONES_PERMISO, VENCIMIENTO_AUTOMATICO
  - `common/enums/tipo-notificacion.enum.ts` — + PERMISO_REVOCADO
  - `app.module.ts` — + NotificacionesModule
  - `backend/package.json` — + @nestjs/schedule
  Quality gates: tsc --noEmit ✅, eslint 0 errores ✅, nest build ✅

  Deuda técnica → B8+:
  - Envío real de correos (SMTP/BullMQ) — tabla notificaciones ya lista con estado PENDIENTE
  - Job vencimiento solicitudes (RN-08 parte 1) — análogo al job de permisos
  - Auth: recuperar/restablecer/cambiar contraseña, GET /me
  - CRUD Usuarios Admin
  - StorageModule: adjuntar documentos a solicitudes

✓ **B8 — Auth completo + CRUD Usuarios + sincronización de estado** ✅ 2026-08-04
  Rama: `feature/fase-2-auth`
  Archivos nuevos:
  - `common/decorators/is-strong-password.decorator.ts` — política RN-51 reutilizable
  - `common/decorators/matches-field.decorator.ts` — validación confirmarContrasena
  - `usuarios/application/dtos/activar-usuario.dto.ts`
  - `usuarios/application/use-cases/activar-usuario/activar-usuario.use-case.ts` — revoca tokens al desactivar
  Archivos modificados:
  - `common/enums/accion-auditoria.enum.ts` — +USUARIO_ACTIVADO, +USUARIO_DESACTIVADO
  - `auth/application/dtos/restablecer-contrasena.dto.ts` — refactor a @IsStrongPassword() + confirmarContrasena
  - `auth/application/dtos/cambiar-contrasena.dto.ts` — refactor a @IsStrongPassword() + confirmarContrasena
  - `auth/infrastructure/controllers/auth.controller.ts` — +@Throttle 3/hora en recuperar-contrasena
  - `usuarios/infrastructure/controllers/usuarios.controller.ts` — +PATCH :id/activar
  - `usuarios/usuarios.module.ts` — +TokenEntity en forFeature, +ActivarUsuarioUseCase
  - `.claude/TASKS.md` — Fase 2 19/19 ✅, Estado Actual actualizado
  - `.claude/ROADMAP.md` — Fase 2 17/17 ✅, Fase 4 body corregido, tabla actualizada
  Quality gates: tsc --noEmit ✅, eslint 0 errores ✅, nest build ✅

  Deuda técnica → B9:
  - StorageModule MinIO: `POST /solicitudes/{id}/documentos` + `GET /solicitudes/{id}/documentos/{docId}`
  - Job vencimiento solicitudes (RN-08 análogo para solicitudes)
  - Envío real de correos (BullMQ/SMTP)

  **Hallazgo de B8:** Auth extendido (recuperar/restablecer/cambiar contraseña, GET /me) y CRUD Usuarios
  ya estaban implementados en el código pero no estaban marcados en TASKS.md ni ROADMAP.md.
  B8 cerró los gaps reales (PATCH activar, rate limit recuperar-contrasena, confirmarContrasena)
  y sincronizó los archivos de estado con la realidad del código.
  **Fase 2 completamente cerrada.**

---

## Bloque B9 — StorageModule + Documentos + VencerSolicitudesJob (2026-08-04)

### Archivos creados
- `backend/src/modules/storage/storage.module.ts` — @Global() module, exporta MinioStorageAdapter
- `backend/src/modules/storage/infrastructure/services/minio-storage.adapter.ts` — adapter extraído con bucketPdfs + bucketDocs
- `backend/src/modules/solicitudes/application/use-cases/adjuntar-documento.use-case.ts` — POST documentos (multipart)
- `backend/src/modules/solicitudes/application/use-cases/obtener-url-documento.use-case.ts` — GET URL firmada (TTL 5 min, RN-53)
- `backend/src/modules/solicitudes/infrastructure/jobs/vencer-solicitudes.job.ts` — Cron 05:01 UTC, RN-08
- `backend/src/modules/solicitudes/application/dtos/adjuntar-documento-query.dto.ts`
- `backend/src/modules/solicitudes/application/dtos/documento-url.dto.ts`

### Archivos modificados
- `backend/src/modules/permisos/infrastructure/services/minio-storage.adapter.ts` — convertido a barrel re-export (backward compat)
- `backend/src/modules/permisos/permisos.module.ts` — eliminado MinioStorageAdapter local (ahora global)
- `backend/src/modules/solicitudes/solicitudes.module.ts` — añadidos use cases, job, ScheduleModule
- `backend/src/modules/solicitudes/infrastructure/controllers/solicitudes.controller.ts` — POST :id/documentos (público)
- `backend/src/modules/solicitudes/infrastructure/controllers/solicitudes-funcionario.controller.ts` — GET :id/documentos/:docId
- `backend/src/modules/solicitudes/infrastructure/services/configuracion-sistema.service.ts` — añadidos obtenerPlazoRevisionHoras / obtenerPlazoCorreccionDias
- `backend/src/modules/solicitudes/infrastructure/persistence/typeorm-solicitud.repository.ts` — implementado marcarVencidas
- `backend/src/modules/solicitudes/domain/ports/solicitud-repository.interface.ts` — añadido marcarVencidas + MarcarVencidasParams
- `backend/src/common/enums/accion-auditoria.enum.ts` — añadidos DESCARGAR_DOCUMENTO + ADJUNTAR_DOCUMENTO
- `backend/src/app.module.ts` — añadido StorageModule

### Mejoras arquitectónicas
- Eliminación de código duplicado: MinioStorageAdapter vivía en PermisosModule; ahora es singleton global en StorageModule
- PermisosModule: backward compat via barrel re-export sin cambiar paths de importación en use-cases

### Quality Gates — B9
- `tsc --noEmit`: ✅ exit 0
- `eslint`: ✅ 0 errors (3 warnings pre-existentes)
- `nest build`: ✅ exit 0

---

## Bloque B10 — Sistema de Notificaciones Reales (2026-08-04)

### Nuevos módulos creados
- `backend/src/modules/redis/redis.module.ts` — RedisModule @Global, exporta REDIS_CLIENT (IORedis)
- `backend/src/modules/redis/redis.constants.ts` — tokens REDIS_CLIENT, EMAIL_NOTIFICATIONS_QUEUE, DLQ
- `backend/src/modules/email/email.module.ts` — EmailModule con IEmailProvider + PlantillaEmailService
- `backend/src/modules/email/domain/ports/email-provider.interface.ts` — IEmailProvider port
- `backend/src/modules/email/infrastructure/providers/smtp-email.provider.ts` — SmtpEmailProvider (Nodemailer)
- `backend/src/modules/email/infrastructure/services/plantilla-email.service.ts` — HTML rendering + branding + XSS escape

### Templates HTML creados
- `backend/src/templates/email/solicitud-recibida.html`
- `backend/src/templates/email/solicitud-aprobada.html`
- `backend/src/templates/email/solicitud-rechazada.html`
- `backend/src/templates/email/correccion-requerida.html`
- `backend/src/templates/email/solicitud-vencida.html`
- `backend/src/templates/email/permiso-revocado.html`
- `backend/src/templates/email/correccion-enviada.html`

### Processor y migración creados
- `backend/src/modules/notificaciones/infrastructure/processors/email.processor.ts` — BullMQ WorkerHost, concurrencia 5, backoff 1m/5m/15m, DLQ
- `backend/database/migrations/1786060800000-AddContextoToNotificaciones.ts` — columna contexto JSONB

### Archivos modificados
- `backend/src/common/enums/tipo-notificacion.enum.ts` — +SOLICITUD_VENCIDA, +CORRECCION_ENVIADA
- `backend/src/modules/notificaciones/infrastructure/persistence/notificacion.entity.ts` — +contexto JSONB
- `backend/src/modules/notificaciones/notificaciones.service.ts` — encola en BullMQ después de persistir en DB
- `backend/src/modules/notificaciones/notificaciones.module.ts` — +BullModule, +EmailModule, +EmailProcessor
- `backend/src/app.module.ts` — +RedisModule, +BullModule.forRootAsync
- `backend/src/modules/solicitudes/solicitudes.module.ts` — +NotificacionesModule
- `backend/nest-cli.json` — assets para copiar templates/*.html a dist/
- `backend/src/modules/solicitudes/application/use-cases/crear-solicitud.use-case.ts` — notifica SOLICITUD_RECIBIDA
- `backend/src/modules/solicitudes/application/use-cases/aprobar-solicitud.use-case.ts` — notifica APROBADA
- `backend/src/modules/solicitudes/application/use-cases/rechazar-solicitud.use-case.ts` — notifica RECHAZADA
- `backend/src/modules/solicitudes/application/use-cases/solicitar-correccion.use-case.ts` — notifica CORRECCION
- `backend/src/modules/solicitudes/infrastructure/jobs/vencer-solicitudes.job.ts` — notifica SOLICITUD_VENCIDA

### Reglas de negocio implementadas
- RN-76: BullMQ asíncrono, 3 reintentos, backoff 1m/5m/15m, DLQ
- RN-77: 7 tipos de notificación al ciudadano y funcionario
- RN-78: emails contienen enlaces al portal web, nunca URLs directas de MinIO
- RN-79: templates HTML con branding institucional desde configuracion_institucional

### Quality Gates — B10
- `tsc --noEmit`: ✅ exit 0
- `eslint`: ✅ 0 errors (3 warnings pre-existentes)
- `nest build`: ✅ exit 0

### Nuevas dependencias
- `@nestjs/bullmq@11.0.4`
- `bullmq`
- `ioredis`
- `nodemailer`
- `@types/nodemailer` (dev)

---

## Bloque B11–B14 — Frontend Portal Ciudadano (2026-08-04)

### B12 — Infraestructura base portal ciudadano
Scaffolding Next.js 15 + React 19, TanStack Query, RHF, Zod, shadcn/ui primitivos, layout, 6 rutas shell (/solicitud /estado /verificar /ayuda /contacto), services, hooks base. Build 9/9 páginas ✅.

### B13 — Formulario ciudadano 5 pasos
- React Hook Form + Zod, FormProvider, zodResolver, PASO_FIELDS para validación parcial
- Stepper con Framer Motion AnimatePresence dirección
- Paso 1: datos ciudadano (colombiano) / Paso 2: motocicleta (placa ABC12D) / Paso 3: motivos dinámicos / Paso 4: FileUploader documentos / Paso 5: resumen + declaración jurada
- localStorage auto-save 500ms, restauración de borrador
- reCAPTCHA v3 dinámico, advertencia en dev si no configurado
- SuccessScreen: radicado prominente, copy/print/consultar/nueva
- Error handling: 400/409/422/500/timeout/offline sin alert()
- WCAG: aria-label, aria-invalid, aria-live, focus management
- Quality gates: tsc + lint + build ✅

### B14 — Consultas ciudadano y validación QR
Archivos creados:
- `frontend/src/schemas/estado.schemas.ts` — estadoConsultaSchema (radicado + documento)
- `frontend/src/schemas/verificar.schemas.ts` — verificarCodigoSchema
- `frontend/src/hooks/use-estado-solicitud.ts` — TanStack Query, fetch-on-demand
- `frontend/src/hooks/use-verificar-permiso.ts` — TanStack Query, enabled por código activo
- `frontend/src/modules/estado/estado-consulta.tsx` — orquestador fetch-on-demand
- `frontend/src/modules/estado/components/solicitud-resultado.tsx` — badge estado, historial timeline, permiso card, PDF download
- `frontend/src/modules/verificar/verificar-form.tsx` — modos idle/manual/camera, dynamic import ssr:false
- `frontend/src/modules/verificar/components/qr-scanner.tsx` — @zxing/browser, cleanup IScannerControls.stop()
- `frontend/src/modules/verificar/components/permiso-resultado.tsx` — semáforo visual verde/rojo/gris

Archivos modificados:
- `frontend/src/types/index.ts` — extendido SolicitudResumenCiudadano (historial[], motivoNombre, funcionarioNombre, permiso.urlDescarga)
- `frontend/src/app/estado/page.tsx` — server component con metadata
- `frontend/src/app/verificar/page.tsx` — server component con metadata

Dependencia añadida: `@zxing/browser` (ADR-018)

Quality gates B14:
- `tsc --noEmit`: ✅ exit 0
- `eslint`: ✅ 0 errores
- `next build`: ✅ 9/9 páginas, /estado 4.88 kB, /verificar 4.83 kB (QrScanner excluido del bundle inicial)

Commit: `feat(frontend): portal ciudadano consultas y validacion QR — B14`

---

## Última actualización

2026-08-04 — B14 completado. Fase 5 cerrada (33/33). Portal ciudadano 100% funcional:
/, /solicitud, /estado, /verificar, /contacto, /ayuda.
Siguiente: Fase 6 (Panel Funcionario) o Fase 8 (Calidad). Requiere autorización.
