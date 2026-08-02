# SESSION.md

# Estado de la Sesión del Proyecto

Este documento mantiene el estado actual del desarrollo para permitir la continuidad entre sesiones.

---

## Fase actual

Fase: Fase 0 — Fundamentos

Estado: Completada

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
✓ Docker Compose: PostgreSQL 15 + Redis 7 + MinIO + Backend NestJS + Frontend Next.js
✓ Husky: pre-commit hooks (lint-staged + commitlint)
✓ Frontend Next.js: scaffolding base con App Router y TailwindCSS

---

## Tareas pendientes

Ninguna en Fase 0. Fase completada (12/12).

---

## Próxima tarea sugerida

Fase 1 — Base de Datos: resolver primero los Pendientes de Diseño [~] M-04 y M-03, luego implementar modelo de datos.

---

## Observaciones

- PR #2 (`feature/fase-0-backend-nestjs` → `develop`) pendiente de merge en GitHub.
- Antes de iniciar Fase 1 se deben resolver:
  - [~] M-04: estructura de ciudadanos (tabla separada vs. campos embebidos en `solicitudes`)
  - [~] M-03: confirmar tabla `historial_contrasenas` en `MODELO_DATOS.md`
- Al hacer merge del PR #2 y crear nueva rama `feature/fase-1-base-datos`, se cierra formalmente la Fase 0.

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

2026-08-02
