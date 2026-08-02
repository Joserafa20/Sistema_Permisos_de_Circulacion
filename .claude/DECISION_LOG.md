# DECISION_LOG.md

# Registro Oficial de Decisiones Técnicas

Este documento registra las decisiones técnicas y arquitectónicas del proyecto.

Su objetivo es mantener la coherencia del desarrollo y evitar que se reevalúen decisiones ya aprobadas.

---

# Reglas

- Registrar únicamente decisiones relevantes.
- No registrar tareas.
- No registrar cambios menores.
- Toda decisión debe incluir su justificación.
- Una decisión solo puede modificarse mediante una nueva entrada.

---

# Formato

## ADR-NNN — AAAA-MM-DD

### Decisión

Descripción de la decisión.

### Justificación

Motivo técnico o funcional.

### Impacto

Módulos afectados.

### Estado

- Vigente
- Reemplazada
- Obsoleta

---

# Decisiones del Proyecto

---

## ADR-001 — 2026-08-02

### Decisión

El backend del sistema se desarrollará con NestJS 10 sobre Node.js 20 LTS.

### Justificación

Arquitectura modular orientada a dominios, soporte nativo de decoradores TypeScript, inyección de dependencias, compatibilidad directa con arquitectura hexagonal y ecosistema maduro (TypeORM, Terminus, Swagger, Passport, BullMQ).

### Impacto

Backend — todos los módulos.

### Estado

Vigente

---

## ADR-002 — 2026-08-02

### Decisión

El frontend se desarrollará con Next.js 14 (App Router) sobre React 18 y TypeScript 5.

### Justificación

App Router introduce Server Components, layouts anidados y carga de datos simplificada. `output: 'standalone'` optimiza la imagen Docker para producción. Ecosistema React maduro con soporte de largo plazo.

**Nota:** Se identificaron 5 CVEs de severidad alta en Next.js 14.x (ninguno crítico). La actualización a Next.js 15 está registrada como primera tarea técnica de Fase 1, antes de implementar cualquier pantalla funcional.

### Impacto

Frontend — portal ciudadano, panel funcionario, panel administrador.

### Estado

Vigente (actualización a v15 pendiente — Fase 1)

---

## ADR-003 — 2026-08-02

### Decisión

La base de datos principal será PostgreSQL 15.

### Justificación

Robustez transaccional, integridad referencial, soporte nativo de UUID, ENUMs, extensiones (`uuid-ossp`, `pgcrypto`) y compatibilidad con TypeORM 0.3. Requerido por las reglas de negocio del PRD (auditoría, historial de estados, soft delete).

### Impacto

Base de datos — todas las fases.

### Estado

Vigente

---

## ADR-004 — 2026-08-02

### Decisión

El almacenamiento de documentos y PDFs utilizará MinIO (S3-compatible).

### Justificación

Permite desarrollo local sin depender de servicios cloud externos. La API S3-compatible garantiza migración transparente a AWS S3 o similar en producción. URLs firmadas para acceso temporal seguro a documentos privados.

### Impacto

Gestión documental (Fase 3), generación de PDF (Fase 4).

### Estado

Vigente

---

## ADR-005 — 2026-08-02

### Decisión

Se utilizará Redis 7 para colas de tareas (BullMQ) y caché de sesiones.

### Justificación

BullMQ requiere Redis como backend. Redis 7 introduce streams mejorados y mejor manejo de memoria. `appendonly yes` con `appendfsync everysec` garantiza durabilidad sin impacto crítico en rendimiento.

### Impacto

Infraestructura — colas de email (Fase 4), refresh tokens (Fase 2).

### Estado

Vigente

---

## ADR-006 — 2026-08-02

### Decisión

La verificación de permisos se realizará mediante códigos QR con identificador UUID + hash SHA-256 opaco.

### Justificación

El código QR no contiene datos del ciudadano directamente — solo un identificador opaco. La verificación ocurre en el servidor consultando `qr_validaciones`. Esto evita falsificaciones y cumple con Ley 1581/2012 (protección de datos). Cada escaneo queda registrado en auditoría.

### Impacto

Módulo de permisos (Fase 4), portal de verificación pública (Fase 5).

### Estado

Vigente

---

## ADR-007 — 2026-08-02

### Decisión

Se utilizará GitFlow como estrategia de control de versiones con Conventional Commits.

### Justificación

Separación clara entre desarrollo (`feature/*`), integración (`develop`) y producción (`main`). Conventional Commits habilitan generación automática de CHANGELOG y versionado semántico. Husky + commitlint garantizan el cumplimiento en cada commit.

### Impacto

Control de versiones — todo el proyecto.

### Estado

Vigente

---

## ADR-008 — 2026-08-02

### Decisión

El proyecto seguirá una metodología incremental por fases (0–8), con una única tarea principal por sesión de desarrollo.

### Justificación

Reduce riesgos técnicos, facilita revisiones de calidad y mantiene el contexto manejable. Cada fase tiene criterios de completitud claros antes de avanzar. Los `[~]` Pendientes de Diseño bloquean el inicio de su fase correspondiente.

### Impacto

Todo el proyecto.

### Estado

Vigente

---

## ADR-009 — 2026-08-02

### Decisión

Docker Compose utiliza la Specification actual (sin atributo `version`).

### Justificación

El atributo `version` fue deprecado en Docker Compose v2. Omitirlo garantiza compatibilidad con versiones actuales y futuras del motor Docker sin warnings ni comportamientos inconsistentes.

### Impacto

Infraestructura Docker — entorno de desarrollo.

### Estado

Vigente

---

## ADR-010 — 2026-08-02

### Decisión

Cada servicio (backend y frontend) tiene un único Dockerfile multi-stage con targets `development`, `build` y `production`.

### Justificación

Un único archivo por servicio evita divergencia entre entornos. El target `development` monta el código fuente como volumen para hot reload. El target `production` produce una imagen mínima sin código fuente ni devDependencies. El usuario no-root (`nestjs`/`nextjs`, uid 1001) reduce la superficie de ataque en producción.

### Impacto

Backend, Frontend — Dockerfile, docker-compose.yml.

### Estado

Vigente

---

## ADR-011 — 2026-08-02

### Decisión

El archivo de configuración de Next.js se nombra `next.config.js` (no `.ts`).

### Justificación

Next.js 14 no soporta `next.config.ts` — esta característica fue introducida en Next.js 15. Forzar la extensión `.ts` en v14 lanza un error fatal al iniciar el servidor de desarrollo y en el build.

### Impacto

Frontend — configuración base.

### Estado

Vigente (se revisará al actualizar a Next.js 15 en Fase 1)

---

## ADR-012 — 2026-08-02

### Decisión

`prettier` se instala como `devDependency` en el `package.json` raíz del monorepo, además de estar en `frontend/package.json`.

### Justificación

`lint-staged` se ejecuta desde la raíz del repositorio y resuelve binarios desde `node_modules/.bin` del directorio de ejecución. Sin `prettier` en la raíz, el hook `pre-commit` falla con "comando no reconocido" al intentar formatear archivos del frontend.

### Impacto

Raíz del monorepo — Husky, lint-staged.

### Estado

Vigente

---

## ADR-013 — 2026-08-02

### Decisión

Husky se instala en la raíz del repositorio (no dentro de `backend/` ni `frontend/`).

### Justificación

Los git hooks se registran en el directorio `.git/`, que reside en la raíz del monorepo. Instalar Husky en un subdirectorio requeriría configuración adicional del path y rompería la integración con `git commit` estándar.

### Impacto

Raíz del monorepo — pre-commit, commit-msg.

### Estado

Vigente

---

## ADR-014 — 2026-08-02

### Decisión

El progreso de las fases se expresa como conteo de tareas (`N / Total completadas`), sin porcentajes fijos.

### Justificación

Los porcentajes fijos (25%, 50%, 75%) son subjetivos y requieren actualización manual estimada. El conteo de tareas es objetivamente derivable leyendo los `[x]` de `TASKS.md`, eliminando ambigüedad y error humano en el tracking.

### Impacto

TASKS.md, ROADMAP.md, SESSION.md — metodología de seguimiento.

### Estado

Vigente

---

# Hallazgos Pendientes (no bloqueantes)

## HAL-001 — 2026-08-02

### Hallazgo

`backend/tsconfig.json` usa `baseUrl: "./"` que fue marcado como deprecated en TypeScript 5.x (error TS5102 en `tsc --noEmit`).

### Contexto

El build de NestJS (`nest build`) funciona correctamente porque usa internamente `tsconfig.build.json` con `ts-jest`. Los path aliases `@common/*`, `@config/*`, `@modules/*` resuelven correctamente en runtime.

### Acción pendiente

Migrar a la sintaxis recomendada en Fase 1:
```json
"paths": {
  "@common/*": ["./src/common/*"],
  "@config/*": ["./src/config/*"],
  "@modules/*": ["./src/modules/*"]
}
```
Eliminar `baseUrl` una vez que los paths sean relativos.

### Fase

Fase 1 — primera tarea técnica.

---

## HAL-002 — 2026-08-02

### Hallazgo

Next.js 14.2.16 tiene 5 vulnerabilidades de severidad alta (DoS, cache poisoning, XSS, SSRF). Ninguna es crítica por CVSS. La corrección requiere actualizar a Next.js 15.

### Acción pendiente

Actualizar a Next.js 15 en Fase 1, antes de implementar pantallas funcionales. El costo de migración es mínimo en scaffolding sin lógica de negocio.

### Fase

Fase 1 — primera tarea técnica (junto con HAL-001).

---

## HAL-003 — 2026-08-02

### Hallazgo

`npm audit` reporta 28 vulnerabilidades en el backend (0 críticas, 8 altas, 17 moderadas, 3 bajas). Las de mayor impacto son en dependencias de producción: `lodash` (prototipo pollution) en `@nestjs/config`, `js-yaml` (prototipo pollution + ReDoS) en `@nestjs/swagger`, `multer` (DoS) en `@nestjs/platform-express`.

Todas las correcciones requieren saltos de versión mayor en NestJS (v10 → v11), lo que implica cambios potencialmente incompatibles en la aplicación.

### Contexto

La aplicación está en Fase 0 — no existe lógica de negocio aún. Las vulnerabilidades de producción (`lodash`, `js-yaml`, `multer`) no son explotables hasta que existan endpoints funcionales que procesen entradas externas.

### Acción pendiente

Evaluar actualización de NestJS v10 → v11 antes del despliegue a producción (Fase 8). En Fase 1 revisar si `multer` (file upload) puede aislarse en su propio módulo con versión controlada.

### Fase

Fase 8 — revisión de seguridad final antes de producción.

---

## HAL-004 — 2026-08-02

### Hallazgo

ESLint v9 (instalado por `@nestjs/cli`) usa flat config por defecto (`eslint.config.js`). El scaffolding de NestJS CLI genera `.eslintrc.json`, que no es reconocido automáticamente por ESLint v9. Al ejecutar `npm run lint`, ESLint retorna exit 0 sin lintear ningún archivo. La compilación TypeScript (`nest build`, `tsc --noEmit`) funciona correctamente.

### Contexto

NestJS CLI v10 aún genera proyectos con `.eslintrc.json`. La migración a flat config de ESLint es un breaking change que requiere reescribir la configuración a formato `eslint.config.js`. No es crítico en Fase 0 porque no existen archivos de lógica de negocio aún.

### Acción pendiente

Migrar `backend/.eslintrc.json` a `backend/eslint.config.js` (flat config ESLint v9) en Fase 1, antes de agregar lógica de negocio. Alternativamente, downgrade a `eslint@8` si la compatibilidad es prioritaria.

### Fase

Fase 1 — primera sesión técnica.

---

# Instrucciones para Claude Code

Antes de modificar una decisión existente:

1. Revisar este documento.
2. Verificar si la decisión continúa vigente.
3. Si se requiere un cambio, registrar una nueva entrada explicando el motivo.
4. Nunca eliminar decisiones anteriores; conservar el historial para auditoría.
