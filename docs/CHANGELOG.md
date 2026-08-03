# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

---

## [Sin Publicar]

### Añadido
- **Auditoría de índices TypeORM** — 7 diferencias corregidas en 6 entidades para sincronizar con MODELO_DATOS.md, schema.sql y migración:
  - `CiudadanoEntity`: eliminado `@Index('idx_ciudadanos_numero_doc')` (duplicaba el índice único del constraint `uq_ciudadanos_numero_documento`).
  - `UsuarioEntity`: eliminado `@Index('idx_usuarios_email')` (duplicaba el índice único del constraint `uq_usuarios_email`); agregado `@Index('idx_usuarios_rol_id', ['rol'])`.
  - `SolicitudEntity`: agregado `@Index('idx_solicitudes_estado_moto', ['motocicleta', 'estado'])` (índice compuesto para RN-03).
  - `AuditoriaRegistroEntity`: renombrado `idx_auditoria_entidad` → `idx_auditoria_entidad_id`.
  - `HistorialEstadoEntity`: renombrado `idx_historial_estados_solicitud_id` → `idx_historial_solicitud_created`.
  - `PermisoEntity`: agregado `@Index('idx_permisos_funcionario_id', ['funcionario'])`.
- `backend/database/migrations/1785628800000-InitialSchema.ts` — Migración inicial TypeORM. Reproduce exactamente `database/schema.sql`: 5 ENUMs, 1 secuencia `seq_codigo_permiso`, 16 tablas, 5 FK circulares vía `ALTER TABLE`, 27 índices regulares, 4 índices parciales, 1 índice único parcial. `up()` y `down()` con orden de reversión correcto (FK circulares primero, tablas en orden inverso de dependencia, drop de secuencia y tipos).
- `ADR-016` — Jerarquía de autoridad entre artefactos del modelo de datos (MODELO_DATOS.md > Entidades > Migraciones > schema.sql). Prohibición de corrección automática de inconsistencias estructurales.
- `DATABASE.md` — sección "Regla de consistencia del modelo" actualizada a versión definitiva: agrega descripción de cada artefacto, regla de no modificación sin autorización, y sección "Regla de propagación de cambios" con secuencia obligatoria de 7 pasos.
- `DECISION_LOG.md` — HAL-004 actualizado con impacto en lint-staged y fecha límite de resolución (antes de Fase 2).
- Reconciliación del modelo de datos: entidades ORM sincronizadas con MODELO_DATOS.md (fuente oficial). INC-001: `hashPdf: string | null` agregado a `PermisoEntity`. INC-002: índice `token_hash` corregido a `idx_tokens_token_hash` no-unique en `TokenEntity`. INC-003: índice compuesto renombrado a `idx_tokens_usuario_tipo_revocado` en `TokenEntity`. Los cuatro artefactos quedan sincronizados.
- `database/schema.sql` — Script SQL completo y autocontenido para PostgreSQL 15+. Incluye: 5 tipos ENUM nativos, secuencia `seq_codigo_permiso`, 16 tablas con 30 FK (25 inline + 5 circulares via ALTER TABLE), 11 CHECK constraints, 27 índices regulares, 4 índices parciales y 1 índice único parcial (`uq_motocicletas_placa_activa`). Fuente: `docs/MODELO_DATOS.md`. 3 inconsistencias detectadas entre entidades ORM y MODELO_DATOS.md (INC-001: `hash_pdf` ausente en `PermisoEntity`; INC-002: `token_hash` unique en entidad vs non-unique en MODELO_DATOS.md; INC-003: nombre de índice compuesto en tokens).

### Por Hacer
- Script SQL completo y migraciones TypeORM — Fase 1 (en progreso).
- Seeds: roles, motivos, configuración, municipio, usuario admin — Fase 1.
- Diagrama entidad-relación — Fase 1.
- Autenticación JWT — Fase 2.
- Módulo de solicitudes — Fase 3.
- PDF + QR — Fase 4.
- Configuración de Docker para producción — Fase 8.
- Pruebas unitarias, de integración y E2E — Fase 8.

---

## [0.2.0] — 2026-08-02

### Añadido

**Fase 1 — Modelo de datos: ENUMs y entidades TypeORM:**

**ENUMs (`backend/src/common/enums/`) — 11 archivos:**
- `estado-solicitud.enum.ts` — PostgreSQL ENUM `estado_solicitud` (6 valores: recibida → vencida).
- `estado-permiso.enum.ts` — PostgreSQL ENUM `estado_permiso` (vigente, vencido, revocado).
- `tipo-documento-adjunto.enum.ts` — PostgreSQL ENUM `tipo_documento_adjunto` (cedula, licencia, soat, rtm, carta_laboral, otro).
- `tipo-config.enum.ts` — PostgreSQL ENUM `tipo_config` (texto, numero, booleano, json, imagen_base64).
- `accion-auditoria.enum.ts` — PostgreSQL ENUM `accion_auditoria` (13 valores: login → exportar_reporte).
- `tipo-token.enum.ts` — TypeScript-only VARCHAR (refresh, reset_contrasena).
- `tipo-documento-identidad.enum.ts` — TypeScript-only VARCHAR (CC, CE, PAS, NIT).
- `tipo-notificacion.enum.ts` — TypeScript-only VARCHAR (4 tipos de notificación).
- `estado-envio-notificacion.enum.ts` — TypeScript-only VARCHAR (pendiente, enviado, error).
- `resultado-qr-validacion.enum.ts` — TypeScript-only VARCHAR (vigente, vencido, revocado, no_encontrado).
- `index.ts` — barrel export de todos los enums.

**Entidades TypeORM (`backend/src/modules/**/infrastructure/persistence/`) — 16 archivos:**
- `roles/` → `RoleEntity` (tabla `roles`).
- `ciudadanos/` → `MunicipioEntity` (tabla `municipios`), `CiudadanoEntity` (tabla `ciudadanos`, Ley 1581/2012), `MotocicletaEntity` (tabla `motocicletas`).
- `dependencias/` → `DependenciaEntity` (tabla `dependencias`).
- `usuarios/` → `UsuarioEntity` (tabla `usuarios`, campo `historial_contrasenas JSONB`).
- `auth/` → `TokenEntity` (tabla `tokens`, índice compuesto usuario+tipo+revocado).
- `motivos/` → `MotivoEntity` (tabla `motivos`).
- `solicitudes/` → `SolicitudEntity` (tabla `solicitudes`, ENUM `estado_solicitud`), `HistorialEstadoEntity` (tabla `historial_estados`).
- `documentos/` → `DocumentoEntity` (tabla `documentos`, `storage_key` nunca expuesto en API).
- `permisos/` → `PermisoEntity` (tabla `permisos`, snapshots JSONB, `storage_key_pdf`), `QrValidacionEntity` (tabla `qr_validaciones`).
- `notificaciones/` → `NotificacionEntity` (tabla `notificaciones`).
- `auditoria/` → `AuditoriaRegistroEntity` (tabla `auditoria`, append-only, retención 5 años Ley 1712/2014).
- `configuracion/` → `ConfiguracionEntity` (tabla `configuracion`).

### Decisiones técnicas
- **M-04 resuelto:** tabla `ciudadanos` separada con FK en `solicitudes` (según DATABASE.md).
- **M-03 resuelto:** `historial_contrasenas JSONB DEFAULT '[]'` en `usuarios` (no tabla separada).
- `enumName` explícito en todos los `@Column({ type: 'enum' })` para forzar nombres exactos de PostgreSQL.
- `Relation<T>` de TypeORM usado para todas las referencias de tipo en relaciones (evita dependencias circulares).
- Columnas `date` tipadas como `string` (comportamiento de TypeORM 0.3 con PostgreSQL `date`).
- Columnas `decimal`/`numeric` tipadas como `string` (TypeORM retorna string para evitar pérdida de precisión float).

---

## [0.1.4] — 2026-08-02

### Añadido

**Fase 0 — Limpieza previa al merge (cierre definitivo):**
- `.claude/DECISION_LOG.md` — reescrito con formato ADR estándar. Documenta ADR-001 a ADR-014 con todas las decisiones arquitectónicas de la Fase 0, más hallazgos HAL-001 (baseUrl deprecated), HAL-002 (Next.js 14 CVEs) y HAL-003 (28 vulnerabilidades NestJS backend — 0 críticas).
- `.claude/RELEASE_PROCESS.md` — proceso oficial de versionado y releases versionado en la rama.
- `.claude/START.md` — punto de entrada de sesiones versionado en la rama.
- `backend/package-lock.json` — lock file del backend generado para reproducibilidad del entorno. npm audit: 28 vulnerabilidades (0 críticas, 8 altas, 17 moderadas, 3 bajas — todas requieren breaking changes de NestJS para corregirse, ver HAL-003).

### Pendiente (diferido a Fase 1)
- HAL-001: corrección de `baseUrl` deprecated en `backend/tsconfig.json` (TS5102 — no bloqueante).
- HAL-002: actualización de Next.js 14 → 15 (5 CVEs altas, 0 críticas — scaffolding sin lógica de negocio).
- HAL-003: revisión de vulnerabilidades en dependencias de producción de NestJS (`lodash`, `js-yaml`, `multer`) — evaluación de upgrade a NestJS v11 antes de despliegue a producción (Fase 8).
- HAL-004: migración de `backend/.eslintrc.json` a flat config ESLint v9 (`eslint.config.js`) — ESLint v9 no reconoce `.eslintrc.json` por defecto (exit 0 sin lintear). TypeScript y build pasan correctamente.

---

## [0.1.3] — 2026-08-02

### Añadido

**Fase 0 — Frontend Next.js: scaffolding base (cierre de Fase 0):**
- `frontend/Dockerfile` — multi-stage: `base`, `development` (hot reload), `build` (Next.js standalone), `production` (imagen mínima con usuario no-root `nextjs`).
- `frontend/package.json` — Next.js 14, React 18, TypeScript 5, TailwindCSS 3, ESLint, Prettier.
- `frontend/tsconfig.json` — TypeScript estricto (`strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`), path alias `@/*`.
- `frontend/next.config.js` — `output: 'standalone'` para Docker optimizado.
- `frontend/tailwind.config.ts` — `darkMode: 'class'`, colores institucionales via variables CSS, content paths configurados.
- `frontend/postcss.config.js` — TailwindCSS + autoprefixer.
- `frontend/.eslintrc.json` — extiende `next/core-web-vitals` + `prettier`.
- `frontend/.prettierrc` — mismas convenciones que el backend (singleQuote, trailingComma, printWidth 100).
- `frontend/.env.example` — `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
- `frontend/src/styles/globals.css` — directivas Tailwind + variables CSS institucionales (`--color-primary-*`).
- `frontend/src/lib/constants.ts` — `API_URL`, `SITE_URL`, `SYSTEM_NAME`, `SYSTEM_SHORT_NAME`.
- `frontend/src/lib/api-client.ts` — función `apiFetch<T>` con manejo de errores y clase `ApiError`.
- `frontend/src/types/index.ts` — contratos `ApiResponse<T>`, `ApiListResponse<T>`, `ApiErrorResponse`, `PaginationMeta` (espejo del backend).
- `frontend/src/app/layout.tsx` — Root layout con Inter (`next/font/google`), metadatos base, `lang="es"`.
- `frontend/src/app/page.tsx` — Página de inicio placeholder (pantallas reales en Fase 5).
- `frontend/src/app/not-found.tsx` — Página 404 global.
- `frontend/src/app/error.tsx` — Error boundary global (`'use client'`).
- `frontend/src/components/ui/.gitkeep` — reserva la carpeta para componentes de Fases 5–7.

### Modificado
- `docker/docker-compose.yml` — servicio `frontend` agregado (Next.js dev server, puerto 3000, `depends_on: backend`).
- `docker/.env.example` — variables `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
- `package.json` (raíz) — `lint-staged` extendido para `frontend/src/**/*.{ts,tsx}`.
- `README.md` — estado Fase 0 actualizado a ✅ Completada; descripción de carpeta `frontend/` actualizada.
- `.claude/TASKS.md` — Frontend marcado `[x]`, Fase 0: 12/12 Completada.
- `.claude/ROADMAP.md` — Fase 0: ✅ Completada; Fase 1: 🔵 Siguiente.
- `.claude/SESSION.md` — estado actualizado, Fase 0 cerrada.

---

## [0.1.2] — 2026-08-02

### Añadido

**Fase 0 — Husky: pre-commit hooks y validación de commits:**
- `package.json` (raíz) — package de herramientas de desarrollo del monorepo. Incluye `prepare: husky`, dependencias `husky@9`, `lint-staged@15`, `@commitlint/cli@19`, `@commitlint/config-conventional@19` y configuración `lint-staged` para archivos TypeScript del backend.
- `commitlint.config.js` — configuración de commitlint: extiende `@commitlint/config-conventional`, define `type-enum` con los 10 tipos del proyecto, `scope-enum` con los 20 alcances del proyecto, `subject-case` (sin mayúsculas de título) y `header-max-length: 100`.
- `.husky/pre-commit` — hook ejecutado antes de cada commit: corre `lint-staged` sobre archivos staged. Si ESLint o Prettier fallan, el commit se cancela.
- `.husky/commit-msg` — hook ejecutado al escribir el mensaje de commit: valida el formato Conventional Commits con `commitlint`. Mensajes fuera del estándar son rechazados automáticamente.
- `package-lock.json` (raíz) — lock file para reproducibilidad de herramientas de desarrollo.

### Modificado
- `.gitignore` — agregada exclusión de `.husky/_/` (directorio interno generado por `husky init`).
- `.claude/TASKS.md` — Husky marcado como `[x]`, progreso 11/12.
- `.claude/ROADMAP.md` — Fase 0: 11/12 tareas completadas.
- `.claude/SESSION.md` — estado actualizado con nueva tarea completada.

---

## [0.1.1] — 2026-08-02

### Añadido

**Fase 0 — Docker Compose e Infraestructura de Desarrollo:**
- `backend/Dockerfile` — Dockerfile multi-stage con 4 etapas: `base`, `development` (hot reload), `build` (compilación TypeScript + poda de dependencias), `production` (imagen mínima con usuario no-root `nestjs`).
- `docker/docker-compose.yml` — Docker Compose Specification (sin atributo `version`) con 5 servicios: `postgres` (PostgreSQL 15 Alpine), `redis` (Redis 7 Alpine), `minio` (MinIO latest), `createbuckets` (MinIO MC para inicialización de buckets), `backend` (NestJS en modo desarrollo con hot reload).
- `docker/docker-compose.override.yml` — Plantilla de sobrescrituras opcionales para entorno local (cambio de puertos en caso de conflictos).
- `docker/.env.example` — Plantilla documentada de variables de entorno para Docker. Incluye todas las variables agrupadas por servicio con instrucciones de uso.
- `docker/postgres/init.sql` — Script de inicialización PostgreSQL: instala extensiones `uuid-ossp` y `pgcrypto` en el primer arranque.

**Características de la infraestructura Docker:**
- Healthchecks en todos los servicios: `pg_isready` (postgres), `redis-cli ping` (redis), HTTP `/minio/health/live` (minio), HTTP `/api/v1/health` (backend).
- Dependencias con condición `service_healthy`: backend no inicia hasta que postgres, redis y minio estén saludables y los buckets creados.
- Volúmenes nombrados: `postgres_data`, `redis_data`, `minio_data` — datos persisten entre reinicios.
- Red dedicada `picoyplaca-network` — comunicación entre servicios exclusivamente por nombre de servicio.
- `restart: unless-stopped` en todos los servicios de infraestructura.
- Logging `json-file` con rotación (`max-size: 10m`, `max-file: 3–5`).
- `CHOKIDAR_USEPOLLING=true` para hot reload en Windows/WSL.
- Buckets MinIO (`pyp-documentos-dev`, `pyp-permisos-dev`, `pyp-reportes-dev`) creados automáticamente con `--ignore-existing`.

### Modificado
- `.gitignore` (raíz) — agregado `docker/.env.docker` a la lista de exclusiones.
- `README.md` — sección "Inicio Rápido" reemplazada con instrucciones Docker completas (tabla de servicios, comandos up/down). Estado Fase 0 actualizado a 75%.
- `.claude/TASKS.md` — Repositorio Git, `.gitignore` y Docker Compose marcados como `[x]`. Estado de Fase 0 actualizado.
- `.claude/ROADMAP.md` — Fase 0 actualizada al 75%. Progreso en barra visual actualizado.
- `.claude/SESSION.md` — Estado actualizado con tarea completada, decisiones técnicas y próximos pasos.

---

## [0.1.0] — 2026-08-02

### Añadido

**Documentación Fundacional del Proyecto:**
- `docs/PRD_Sistema_Permisos_de_Circulacion.md` — Documento de Requerimientos del Producto (PRD) completo. Define actores, flujos, stack tecnológico y requisitos del sistema.
- `docs/ANALISIS_TECNICO.md` — Análisis técnico completo del sistema elaborado por el Arquitecto de Software Senior. Incluye resumen ejecutivo, objetivo del sistema, fortalezas, debilidades, riesgos técnicos, riesgos de seguridad, riesgos operativos, requisitos ambiguos, requisitos faltantes, casos de uso faltantes, recomendaciones y plan de implementación.
- `docs/MODELO_DATOS.md` — Modelo de datos empresarial de PostgreSQL. 17 tablas, 5 ENUMs nativos, 25 índices, diagramas Mermaid del ER y máquinas de estados.
- `docs/API_FUNCIONAL.md` — Especificación completa de la API REST. 56 endpoints documentados con request, response, errores, permisos y ejemplos.
- `docs/CASOS_USO.md` — 41 casos de uso del sistema cubriendo los 5 actores: Ciudadano, Funcionario, Administrador, Sistema y Autoridad de Tránsito.
- `docs/HISTORIAS_USUARIO.md` — 43 historias de usuario distribuidas en 8 épicas con criterios de aceptación, escenarios de prueba y estimaciones de puntos de historia.
- `docs/REGLAS_NEGOCIO.md` — 100 reglas de negocio numeradas (RN-01 a RN-100) clasificadas en 8 categorías: solicitudes, permisos, seguridad, auditoría, notificaciones, configuración y privacidad.
- `docs/DECISIONS.md` — 9 decisiones de arquitectura (ADR) documentadas: NestJS, Next.js, PostgreSQL, JWT, Swagger, Arquitectura Hexagonal, UUID, Docker y QR de verificación.
- `docs/PLAN_PRUEBAS.md` — Estrategia de pruebas completa. Pruebas unitarias, de integración, funcionales, de aceptación (UAT), de seguridad (OWASP Top 10) y de rendimiento. Criterios de aprobación y rechazo.
- `docs/PLAN_DESPLIEGUE.md` — Plan de despliegue detallado. Arquitectura de infraestructura, Docker, variables de entorno, PostgreSQL, backups, SSL, Nginx, monitoreo, logs, CI/CD, procedimientos de despliegue, rollback y actualización.
- `docs/MANUAL_TECNICO.md` — Manual técnico completo para el equipo de desarrollo y TI. Arquitectura, tecnologías, instalación, configuración, compilación, ejecución, BD, Docker, Swagger, mantenimiento y buenas prácticas.
- `docs/MANUAL_USUARIO.md` — Manual de usuario para los tres perfiles: Ciudadano (guía paso a paso del trámite), Funcionario (gestión de la cola de solicitudes) y Administrador (configuración y administración del sistema).
- `docs/GLOSARIO.md` — Glosario oficial del proyecto con términos funcionales, técnicos y administrativos.
- `docs/CHANGELOG.md` — Este archivo. Registro histórico de cambios del proyecto.

**Contexto Permanente del Proyecto (`.claude/`):**
- `.claude/CLAUDE.md` — Instrucciones y convenciones del proyecto.
- `.claude/START.md` — Punto de entrada para nuevas sesiones de desarrollo.
- `.claude/TASKS.md` — Lista de tareas por sprint.
- `.claude/ROADMAP.md` — Hoja de ruta del proyecto (Fases 0-8, ~10 semanas).
- `.claude/PROJECT_CONTEXT.md` — Contexto del negocio, reglas de negocio base y flujos de estado.
- `.claude/ARCHITECTURE.md` — Descripción de la arquitectura hexagonal, módulos NestJS, puertos y adaptadores.
- `.claude/DATABASE.md` — Referencia de tablas, ENUMs, índices y seeds.
- `.claude/API.md` — Referencia de endpoints y contratos de API.
- `.claude/SECURITY.md` — Políticas de seguridad, RBAC, rate limiting y checklist de seguridad.

**Memoria del Proyecto:**
- `memory/project_prd.md` — Memoria persistente del PRD y stack tecnológico.
- `memory/MEMORY.md` — Índice de memorias del proyecto.

### Marco Técnico Definido

**Stack tecnológico validado:**
- Backend: NestJS 10 + TypeScript 5 + TypeORM 0.3 (Node.js 20 LTS)
- Frontend: Next.js 14 + React 18 + TypeScript 5 + TailwindCSS 3
- Base de Datos: PostgreSQL 15 con extensiones `uuid-ossp` y `pg_stat_statements`
- Caché y Cola: Redis 7 + BullMQ 4
- Storage: MinIO (S3-compatible)
- Autenticación: JWT (Access 15 min + Refresh 7 días con rotación)
- PDF: PDFKit o Puppeteer (a definir en Fase 4)
- QR: librería `qrcode`
- Correo: Nodemailer/SendGrid vía BullMQ
- Contenedorización: Docker + Docker Compose + Nginx
- Testing: Jest + Supertest + Playwright

**Arquitectura definida:**
- Patrón: Hexagonal (Ports & Adapters)
- 17 módulos NestJS identificados
- 56 endpoints REST documentados
- 17 tablas de base de datos definidas
- 5 ENUMs nativos de PostgreSQL
- Flujos de estados para solicitudes y permisos documentados

**Seguridad definida:**
- BCrypt 12 rounds para contraseñas
- Rate limiting por endpoint (valores específicos en `SECURITY.md`)
- URLs firmadas TTL 5 min para todos los archivos del storage
- Código QR opaco (UUID + SHA-256 + salt secreto)
- Auditoría append-only con retención de 5 años
- Cumplimiento Ley 1581/2012 (consentimiento de tratamiento de datos)

### Reglas de Negocio Base

- **14 reglas originales del PRD** (RN-01 a RN-14) formalizadas y expandidas.
- **86 reglas adicionales** (RN-15 a RN-100) derivadas del análisis técnico.
- Máquina de estados de solicitudes: `recibida → en_revision → aprobada | rechazada | pendiente_correccion | vencida`.
- Máquina de estados de permisos: `vigente → vencido | revocado`.
- Citizen identification: radicado + número de documento (sin cuenta de usuario).
- Formato de radicado: `AAAAMMDD-PYP-XXXXXX`.
- Formato de número de permiso: `AAAA-PYP-NNNNN`.

---

## Historial de Versiones

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 0.1.4 | 2026-08-02 | Limpieza previa al merge: DECISION_LOG (ADR-001–014, HAL-001–003), lockfile backend, archivos de contexto. |
| 0.1.3 | 2026-08-02 | Frontend Next.js 14: scaffolding base, Dockerfile, TailwindCSS, tipos compartidos. Fase 0 completada. |
| 0.1.2 | 2026-08-02 | Husky: pre-commit hooks (lint-staged), commitlint, Conventional Commits. |
| 0.1.1 | 2026-08-02 | Docker Compose: PostgreSQL, Redis, MinIO, NestJS dev. Healthchecks, red y volúmenes dedicados. |
| 0.1.0 | 2026-08-02 | Documentación fundacional completa. Inicio del proyecto. |

---

[Sin Publicar]: https://github.com/alcaldia/pyp-sistema/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/alcaldia/pyp-sistema/releases/tag/v0.1.0
