# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

---

## [Sin Publicar]

### Por Hacer
- Implementación del backend (NestJS).
- Implementación del frontend (Next.js).
- Scripts SQL y migraciones TypeORM.
- Configuración de Docker para producción.
- Pruebas unitarias, de integración y E2E.

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
