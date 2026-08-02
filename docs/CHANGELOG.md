# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

---

## [Sin Publicar]

### Por Hacer
- Implementación del frontend (Next.js) — Fase 0 pendiente.
- Scripts SQL y migraciones TypeORM — Fase 1.
- Autenticación JWT — Fase 2.
- Módulo de solicitudes — Fase 3.
- PDF + QR — Fase 4.
- Configuración de Docker para producción — Fase 8.
- Pruebas unitarias, de integración y E2E — Fase 8.

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
| 0.1.0 | 2026-08-02 | Documentación fundacional completa. Inicio del proyecto. |

---

[Sin Publicar]: https://github.com/alcaldia/pyp-sistema/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/alcaldia/pyp-sistema/releases/tag/v0.1.0
