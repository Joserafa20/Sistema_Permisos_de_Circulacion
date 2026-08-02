# RELEASE_PROCESS.md

# Proceso Oficial de Versionado y Releases

Este documento define el flujo obligatorio de Git, Pull Requests, Versionado y Releases del proyecto.

---

# Estrategia Git

El proyecto utiliza GitFlow.

## Ramas Permanentes

main

Contiene únicamente versiones estables en producción.

develop

Contiene el desarrollo integrado listo para pruebas.

---

## Ramas Temporales

feature/*

Desarrollo de nuevas funcionalidades.

Ejemplo

feature/auth-login

feature/usuarios-crud

feature/permisos-qr

---

bugfix/*

Corrección de errores detectados durante desarrollo.

Ejemplo

bugfix/login

---

hotfix/*

Correcciones urgentes sobre producción.

Ejemplo

hotfix/token-expiration

---

release/*

Preparación de una nueva versión.

Ejemplo

release/v1.0.0

---

# Flujo Oficial

Nueva funcionalidad

↓

feature/nombre-funcionalidad

↓

Pull Request

↓

develop

↓

Testing

↓

release/vX.X.X

↓

QA

↓

main

↓

Tag

↓

Producción

---

# Convención para nombres de ramas

feature/<modulo>-<funcionalidad>

Ejemplos

feature/auth-login

feature/auth-jwt

feature/usuarios

feature/roles

feature/solicitudes

feature/permisos

feature/dashboard

feature/reportes

---

# Convención de Commits

Utilizar Conventional Commits.

Ejemplos

feat(auth): implementar login JWT

feat(users): crear CRUD usuarios

feat(qr): generar código QR

fix(login): corregir validación

fix(pdf): corregir generación PDF

refactor(api): simplificar servicios

style(frontend): mejorar estilos

docs(api): actualizar documentación

test(auth): agregar pruebas unitarias

chore(docker): actualizar Docker Compose

---

# Pull Requests

Todo Pull Request debe incluir:

## Resumen

Descripción de la funcionalidad.

---

## Objetivo

Qué problema resuelve.

---

## Archivos modificados

Listado de archivos importantes.

---

## Riesgos

Posibles impactos.

---

## Evidencias

Capturas o pruebas realizadas.

---

## Checklist

- Código compila.
- Linter sin errores.
- Pruebas ejecutadas.
- Swagger actualizado.
- Documentación actualizada.
- TASKS actualizado.
- ROADMAP actualizado.
- CHANGELOG actualizado.
- SESSION actualizado.

---

# Versionado

Utilizar Semantic Versioning.

MAJOR.MINOR.PATCH

Ejemplos

0.1.0

0.2.0

0.3.0

1.0.0

1.1.0

1.1.1

---

## Cuándo aumentar versión

PATCH

Corrección de errores.

MINOR

Nueva funcionalidad compatible.

MAJOR

Cambios incompatibles.

---

# Antes de Merge

Antes de aceptar un Pull Request verificar:

- QUALITY_GATE aprobado.
- Sin conflictos.
- Sin errores de compilación.
- Sin vulnerabilidades críticas.
- Documentación actualizada.

---

# Antes de Release

Verificar:

Backend

Frontend

Base de Datos

Docker

Swagger

Variables de entorno

Logs

Auditoría

Pruebas

Documentación

---

# Antes de Producción

Debe existir:

Release creada.

Tag creada.

CHANGELOG actualizado.

Manual Técnico actualizado.

Manual Usuario actualizado.

Plan de Despliegue actualizado.

---

# Después del Merge

Actualizar:

TASKS.md

ROADMAP.md

CHANGELOG.md

SESSION.md

Registrar:

Versión.

Fecha.

Responsable.

Resumen de cambios.

---

# Rol de Claude Code

Claude Code deberá:

- Seguir GitFlow.
- Nunca trabajar directamente sobre main.
- Crear ramas feature para nuevas funcionalidades.
- Recomendar Pull Request al finalizar una tarea importante.
- Actualizar CHANGELOG automáticamente.
- Recomendar incremento de versión cuando corresponda.
- Esperar aprobación del usuario antes de realizar merges importantes.

---

# Política del Proyecto

La prioridad siempre será:

1. Calidad.
2. Seguridad.
3. Arquitectura.
4. Documentación.
5. Código.

Nunca sacrificar calidad por velocidad.

Nunca realizar merge a main sin cumplir QUALITY_GATE.md.

Fin del documento.