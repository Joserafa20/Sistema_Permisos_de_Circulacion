# Sistema Web de Permisos de Circulación (Pico y Placa)

Sistema institucional para la gestión digital de permisos de circulación de motocicletas durante la restricción Pico y Placa, desarrollado para una Alcaldía de Colombia.

---

## Descripción

Permite que los ciudadanos soliciten permisos de circulación especiales en línea. Un funcionario revisa la solicitud y los documentos adjuntos, y al aprobarla el sistema genera automáticamente un permiso en PDF con código QR único y verificable por autoridades de tránsito.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 10 + Node.js 20 LTS + TypeScript 5 |
| Frontend | Next.js 14 + React 18 + TailwindCSS 3 |
| Base de Datos | PostgreSQL 15 + TypeORM 0.3 |
| Caché / Colas | Redis 7 + BullMQ |
| Storage | MinIO (S3-compatible) |
| Autenticación | JWT (Access 15 min + Refresh 7 días) |
| Contenedores | Docker + Docker Compose + Nginx |

---

## Arquitectura

Arquitectura Hexagonal (Ports & Adapters) + principios de Clean Architecture.

```
src/módulo/
├── domain/          ← Entidades, value-objects, interfaces de repositorios
├── application/     ← Casos de uso, DTOs
└── infrastructure/  ← Controllers, TypeORM, adapters (PDF, QR, Email, Storage)
```

---

## Estructura del Repositorio

```
├── .claude/         ← Contexto permanente del proyecto (ROADMAP, TASKS, SECURITY...)
├── docs/            ← PRD, Análisis Técnico, Modelo de Datos, API, Manuales
├── backend/         ← API REST NestJS
├── frontend/        ← Interfaz Next.js (pendiente Fase 5)
├── database/        ← Migraciones TypeORM y seeds (pendiente Fase 1)
└── docker/          ← Docker Compose, Dockerfile, init scripts
```

---

## Estado del Proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| Documentación | PRD, API, Modelo de Datos, Manuales, Auditoría | ✅ Completa |
| Fase 0 | Fundamentos e infraestructura base | 🟡 En progreso (75%) |
| Fase 1 | Base de datos y migraciones | ⬜ Pendiente |
| Fase 2 | Autenticación y seguridad | ⬜ Pendiente |
| Fase 3 | Módulo de Solicitudes (backend) | ⬜ Pendiente |
| Fase 4 | Generación de Permiso (PDF + QR) | ⬜ Pendiente |
| Fase 5 | Frontend Portal Ciudadano | ⬜ Pendiente |
| Fase 6 | Frontend Panel Funcionario | ⬜ Pendiente |
| Fase 7 | Frontend Panel Administrador | ⬜ Pendiente |
| Fase 8 | Calidad y Producción | ⬜ Pendiente |

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
| MinIO Console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

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
# Completar variables en .env (requiere PostgreSQL, Redis y MinIO locales)

npm install
npm run start:dev
```

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
| Roadmap | `.claude/ROADMAP.md` |

---

## Marco Legal

Ley 527/1999 · Ley 1581/2012 · Decreto 1377/2013 · Ley 1712/2014 · CONPES 3854/2016 · NTC 5854
