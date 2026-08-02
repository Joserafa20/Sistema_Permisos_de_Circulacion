# SESSION.md

# Estado de la Sesión del Proyecto

Este documento mantiene el estado actual del desarrollo para permitir la continuidad entre sesiones.

---

## Fase actual

Fase: Fase 1 — Base de Datos y Migraciones

Estado: 🔵 Activa — Rama: `feature/fase-1-base-datos`

---

## Fase anterior

Fase: Fase 0 — Fundamentos

Estado: ✅ CERRADA — Mergeada a develop el 2026-08-02 (PR #2 → merge commit 33d6990)

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

---

## Tareas pendientes — Fase 1

- [ ] Script SQL completo (`database/schema.sql`) — ✅ COMPLETADO
- [ ] Migraciones TypeORM para todas las tablas
- [ ] Índices de rendimiento aplicados desde el inicio
- [ ] Seeds: roles, motivos, configuración inicial, municipio, usuario admin temporal
- [ ] Diagrama entidad-relación generado (`docs/ER_DIAGRAM.md`)

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

## Última actualización

2026-08-02 — Fase 1: `database/schema.sql` completado (16 tablas, 5 ENUMs, 30 FKs, 11 CHECKs, 32 índices). 3 inconsistencias ORM↔MODELO_DATOS detectadas y reportadas al usuario.
