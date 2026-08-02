# SESSION.md

# Estado de la Sesión del Proyecto

Este documento mantiene el estado actual del desarrollo para permitir la continuidad entre sesiones.

---

## Fase actual

Fase: Fase 0 — Fundamentos

Estado: En progreso

---

## Tareas completadas

✓ Repositorio Git + GitFlow (main, develop, feature/*, hotfix/*)
✓ `.gitignore` completo (Node, env, build)
✓ Backend NestJS: scaffolding base con ConfigModule tipado
✓ Archivo `.env.example` completo con todas las variables
✓ ESLint + Prettier configurados
✓ Swagger configurado y accesible en `/api/docs`
✓ Endpoint `/api/v1/health` operativo
✓ Logger estructurado (Pino) configurado
✓ README.md con instrucciones de setup local
✓ Docker Compose: PostgreSQL 15 + Redis 7 + MinIO + Backend NestJS

---

## Tareas pendientes

□ Frontend Next.js: scaffolding base con App Router y TailwindCSS
□ Husky (pre-commit hooks)

---

## Próxima tarea sugerida

Husky — pre-commit hooks con lint-staged y commitlint

---

## Observaciones

- PR #2 (`feature/fase-0-backend-nestjs` → `develop`) publicado en GitHub. Pendiente de revisión y merge.
- Al completar Husky y Frontend Next.js, Fase 0 queda en 12/12 tareas y puede marcarse como completada.
- Antes de iniciar Fase 1 resolver los `[~]` M-04 y M-03 (estructura ciudadanos + historial_contraseñas).

---

## Decisiones Técnicas (sesión activa)

- Docker Compose Specification sin atributo `version` (compatibilidad con Docker Engine actual).
- Dockerfile multi-stage único: una sola imagen, tres targets (development/build/production).
- `createbuckets` como servicio `on-failure` de un solo uso: crea buckets en MinIO al iniciar.
- `CHOKIDAR_USEPOLLING=true` para hot reload en entornos Windows/WSL con volúmenes montados.
- `$$REDIS_PASSWORD` en healthcheck Redis: `$$` en compose = `$` literal dentro del contenedor.
- Progreso del proyecto expresado como conteo de tareas (`N / Total`), sin porcentajes fijos.

---

## Última actualización

2026-08-02
