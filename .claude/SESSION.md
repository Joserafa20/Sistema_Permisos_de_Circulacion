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
✓ Husky: pre-commit hooks (lint-staged + commitlint)

---

## Tareas pendientes

□ Frontend Next.js: scaffolding base con App Router y TailwindCSS

---

## Próxima tarea sugerida

Frontend Next.js — scaffolding base con App Router y TailwindCSS

---

## Observaciones

- PR #2 (`feature/fase-0-backend-nestjs` → `develop`) publicado en GitHub. Pendiente de revisión y merge.
- Al completar Frontend Next.js, Fase 0 queda en 12/12 tareas y puede marcarse como completada.
- Antes de iniciar Fase 1 resolver los `[~]` M-04 y M-03 (estructura ciudadanos + historial_contraseñas).

---

## Decisiones Técnicas (sesión activa)

- Husky instalado en raíz del repositorio (donde vive `.git`), no dentro de `backend/`.
- `package.json` raíz creado exclusivamente para herramientas de desarrollo del monorepo.
- Hook `pre-commit`: lint-staged sobre `backend/src/**/*.ts` y `backend/test/**/*.ts`.
  ESLint y Prettier se ejecutan con la config de `backend/` (la detectan subiendo desde la ruta del archivo).
- Hook `commit-msg`: commitlint valida formato Conventional Commits antes de aceptar el commit.
- `commitlint.config.js` define `type-enum` (tipos permitidos) y `scope-enum` (alcances del proyecto)
  como advertencia, no error — permite alcances no listados sin bloquear el commit.
- `.husky/_/` excluido del repositorio (generado por husky init, no es código de la app).
- `--max-warnings=0` en ESLint dentro de lint-staged: cualquier warning bloquea el commit.

---

## Última actualización

2026-08-02
