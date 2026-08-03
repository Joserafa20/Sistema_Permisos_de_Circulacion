# SESSION.md

# Estado de la Sesión del Proyecto

Este documento mantiene el estado actual del desarrollo para permitir la continuidad entre sesiones.

---

## Fase actual

Fase: Fase 2 — Autenticación y Seguridad

Estado: ⬜ Pendiente de inicio — Rama a crear: `feature/fase-2-auth`

---

## Fase anterior

Fase: Fase 1 — Base de Datos y Migraciones

Estado: ✅ CERRADA — Pendiente merge de `feature/fase-1-base-datos` → `develop` (PR a crear)

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

Fase 1 — segunda tarea: Script SQL completo y migraciones TypeORM.

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

## Última actualización

2026-08-02 — Auditoría final Fase 1 completada. CHANGELOG consolidado en v0.2.0. SESSION actualizado.
Fase 1 lista para cierre oficial mediante PR feature/fase-1-base-datos → develop.
