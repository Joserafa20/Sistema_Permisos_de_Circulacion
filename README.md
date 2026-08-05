# Sistema Web de Permisos de Circulación (Pico y Placa)

> **v1.0.0 Release Candidate** — Sistema institucional para la gestión digital de permisos de circulación de motocicletas durante la restricción Pico y Placa, desarrollado para una Alcaldía de Colombia.

---

## Descripción

Permite que los ciudadanos soliciten permisos de circulación especiales en línea. Un funcionario revisa la solicitud y los documentos adjuntos, y al aprobarla el sistema genera automáticamente un permiso en PDF con código QR único y verificable por autoridades de tránsito.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 10 + Node.js 20 LTS + TypeScript 5 |
| Frontend | Next.js 15.3 + React 19 + TailwindCSS 3 |
| Base de Datos | PostgreSQL 15 + TypeORM 0.3 |
| Caché / Colas | Redis 7 + BullMQ 5 |
| Storage | MinIO RELEASE.2024-11-07 (S3-compatible) |
| Autenticación | JWT (Access 15 min + Refresh 7 días) + MFA TOTP |
| Contenedores | Docker + Docker Compose + Nginx |
| Observabilidad | Pino + Prometheus (prom-client) + OpenTelemetry |

---

## Arquitectura

Arquitectura Hexagonal (Ports & Adapters) + principios de Clean Architecture.

```
backend/src/módulo/
├── domain/          ← Entidades, value-objects, interfaces de repositorios
├── application/     ← Casos de uso, DTOs, servicios de dominio
└── infrastructure/  ← Controllers, TypeORM adapters (PDF, QR, Email, Storage)
```

---

## Estructura del Repositorio

```
├── .claude/         ← Contexto permanente del proyecto (ROADMAP, TASKS, START, SECURITY...)
├── .github/         ← Workflows CI/CD, CODEOWNERS, plantillas PR/Issues
├── docs/            ← PRD, Análisis Técnico, Modelo de Datos, API, Manuales
├── backend/         ← API REST NestJS (56 endpoints, arquitectura hexagonal)
├── frontend/        ← Portales Web Next.js 15 (ciudadano + funcionario + administrador)
├── database/        ← Migraciones TypeORM y seeds
└── docker/          ← Docker Compose (dev y prod), Dockerfiles, Nginx, init scripts
```

---

## Estado del Proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| Documentación | PRD, API, Modelo de Datos, Manuales, Auditoría | ✅ Completa |
| Fase 0 | Fundamentos e infraestructura base | ✅ Completada |
| Fase 1 | Base de datos y migraciones | ✅ Completada |
| Fase 2 | Autenticación JWT + MFA TOTP | ✅ Completada |
| Fase 3 | Módulo de Solicitudes (backend) | ✅ Completada |
| Fase 4 | Generación de Permiso (PDF + QR + MinIO) | ✅ Completada |
| Fase 5 | Frontend Portal Ciudadano | ✅ Completada |
| Fase 6 | Frontend Panel Funcionario | ✅ Completada |
| Fase 7 | Frontend Panel Administrador | ✅ Completada |
| Fase 8 | Calidad, Pruebas y Observabilidad | ✅ Completada |
| RC1–RC3 | Auditoría integral + correcciones | ✅ Completado |
| **v1.0.0** | **Release Candidate** | ✅ **Listo** |

---

## Inicio Rápido

### Con Docker (recomendado)

```bash
cd docker
cp .env.example .env.docker
# Editar .env.docker con valores reales
docker compose --env-file .env.docker up --build
```

| Servicio | URL |
|----------|-----|
| API REST | http://localhost:3001/api/v1 |
| Swagger UI | http://localhost:3001/api/docs |
| Portal Ciudadano | http://localhost:3000 |
| MinIO Console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| Mailpit (dev) | http://localhost:8025 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3100 |

```bash
# Detener (conserva datos)
docker compose --env-file .env.docker down

# Detener y eliminar datos
docker compose --env-file .env.docker down -v
```

### Sin Docker (backend solo)

```bash
cd backend
cp .env.example .env
# Completar variables (requiere PostgreSQL, Redis y MinIO locales)
npm install
npm run start:dev
```

---

## Seguridad

Ver [SECURITY.md](SECURITY.md) para el checklist completo de seguridad implementado.

Aspectos clave:
- JWT firmado HS256, refresh tokens SHA-256 en BD (nunca en texto plano)
- BCrypt 12 rounds, MFA TOTP para ADMINISTRADOR (RFC 6238)
- Throttle global (100 req/min) + throttle por endpoint en auth
- `storage_key` NUNCA expuesto en respuestas — solo signed URLs ≤ 5 min
- Helmet + HSTS + CSP en Nginx
- Tabla auditoría append-only (Ley 1712/2014)

Para reportar vulnerabilidades: ver [SECURITY.md](SECURITY.md) → sección "Reporte".

---

## Documentación

| Documento | Ruta |
|-----------|------|
| PRD (requerimientos) | `docs/PRD_Sistema_Permisos_de_Circulacion.md` |
| Análisis Técnico | `docs/ANALISIS_TECNICO.md` |
| Modelo de Datos | `docs/MODELO_DATOS.md` |
| API REST (56 endpoints) | `docs/API_FUNCIONAL.md` |
| Reglas de Negocio (100 RN) | `docs/REGLAS_NEGOCIO.md` |
| Plan de Pruebas | `docs/PLAN_PRUEBAS.md` |
| Plan de Despliegue | `docs/PLAN_DESPLIEGUE.md` |
| Manual Técnico | `docs/MANUAL_TECNICO.md` |
| Manual de Usuario | `docs/MANUAL_USUARIO.md` |
| Guía de Despliegue Rápido | `README_DEPLOY.md` |
| Checklist de Producción | `PRODUCTION_CHECKLIST.md` |
| Auditoría de Seguridad | `SECURITY_AUDIT.md` |
| Reporte de Rendimiento | `PERFORMANCE_REPORT.md` |
| Roadmap | `.claude/ROADMAP.md` |
| Historial de versiones | `CHANGELOG.md` |

---

## Guía de Contribución

Ver [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) — GitFlow, Conventional Commits, flujo de PR.

---

## Marco Legal

Ley 527/1999 · Ley 1581/2012 · Decreto 1377/2013 · Ley 1712/2014 · CONPES 3854/2016 · NTC 5854

---

## Licencia

Software Institucional — Todos los derechos reservados. Ver [LICENSE](LICENSE).
