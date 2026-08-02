# Guía de Contribución — Sistema de Permisos de Circulación

---

## Flujo de Trabajo (GitFlow)

### Estructura de Ramas

| Rama | Propósito | Base | Merge hacia |
|------|-----------|------|-------------|
| `main` | Producción estable | — | — |
| `develop` | Integración de features | `main` | `main` (vía release) |
| `feature/*` | Nuevas funcionalidades | `develop` | `develop` |
| `bugfix/*` | Corrección de bugs en desarrollo | `develop` | `develop` |
| `hotfix/*` | Corrección urgente en producción | `main` | `main` + `develop` |
| `release/*` | Preparación de versión | `develop` | `main` + `develop` |

### Reglas estrictas

- ❌ **Nunca** hacer commit directamente en `main`.
- ❌ **Nunca** hacer commit directamente en `develop`.
- ✅ Todo desarrollo ocurre en una rama `feature/*`.
- ✅ Toda corrección en desarrollo ocurre en una rama `bugfix/*`.
- ✅ Toda corrección urgente de producción ocurre en una rama `hotfix/*`.
- ✅ Todo cambio requiere Pull Request con al menos 1 aprobación.

---

## Nombrado de Ramas

```
feature/fase-N-descripcion-corta
bugfix/descripcion-del-bug
hotfix/descripcion-urgente
release/v1.0.0
```

**Ejemplos:**
```
feature/fase-1-modelo-datos
feature/fase-2-autenticacion-jwt
feature/fase-3-modulo-solicitudes
bugfix/validacion-placa-duplicada
hotfix/qr-verificacion-500
release/v0.2.0
```

---

## Conventional Commits

Todos los commits deben seguir el estándar [Conventional Commits](https://www.conventionalcommits.org/es/).

### Formato

```
<tipo>(<alcance>): <descripción corta en imperativo>

[cuerpo opcional — explicar el QUÉ y el POR QUÉ, no el CÓMO]

[pie opcional — Breaking changes, referencias a issues]
```

### Tipos permitidos

| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Formato, comas, punto y coma (sin cambio de lógica) |
| `refactor` | Refactorización sin nueva funcionalidad ni fix |
| `test` | Agregar o corregir tests |
| `chore` | Tareas de mantenimiento (deps, build, CI) |
| `perf` | Mejora de rendimiento |
| `ci` | Cambios en CI/CD |
| `revert` | Revertir un commit anterior |

### Alcances del proyecto

```
auth, solicitudes, permisos, documentos, usuarios, dependencias,
motivos, configuracion, auditoria, reportes, qr, pdf, notificaciones,
health, storage, config, common, docker, ci, docs
```

### Ejemplos de commits válidos

```
feat(solicitudes): agregar endpoint POST /solicitudes con validación de placa duplicada

fix(auth): corregir expiración de refresh token en zona horaria COT

docs(api): actualizar ejemplos de respuesta en endpoint de aprobación

test(permisos): agregar tests E2E del flujo crear solicitud → aprobar → generar QR

chore(deps): actualizar typeorm a 0.3.21 y @nestjs/common a 10.4.5

feat(qr)!: cambiar formato de código opaco de MD5 a SHA-256

BREAKING CHANGE: los códigos QR existentes dejan de ser válidos con este cambio
```

---

## Flujo Paso a Paso

### 1. Iniciar una nueva tarea (feature)

```bash
# Asegurarse de estar en develop actualizado
git checkout develop
git pull origin develop

# Crear la rama de la tarea
git checkout -b feature/fase-N-descripcion

# Desarrollar...
git add <archivos>
git commit -m "feat(módulo): descripción corta"

# Publicar y abrir PR
git push -u origin feature/fase-N-descripcion
```

### 2. Abrir Pull Request

- **Base:** `develop`
- **Compare:** `feature/fase-N-descripcion`
- Usar la plantilla de PR (`.github/PULL_REQUEST_TEMPLATE.md`)
- Asignar al menos 1 revisor

### 3. Preparar un Release

```bash
git checkout develop
git pull origin develop
git checkout -b release/v0.2.0

# Ajustar versión en package.json, CHANGELOG.md, etc.
git commit -m "chore(release): preparar versión v0.2.0"

# PR: release/v0.2.0 → main
# Tras merge en main:
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0

# Merge back a develop
git checkout develop
git merge release/v0.2.0
git push origin develop
```

### 4. Hotfix de producción

```bash
git checkout main
git pull origin main
git checkout -b hotfix/descripcion-urgente

# Corregir...
git commit -m "fix(módulo): descripción del fix urgente"

# PR: hotfix/* → main
# Tras merge en main:
git checkout develop
git merge hotfix/descripcion-urgente
git push origin develop
```

---

## Checklist de Pull Request

Antes de solicitar revisión, verificar:

- [ ] La rama parte de `develop` (o `main` para hotfix).
- [ ] Todos los commits siguen Conventional Commits.
- [ ] El código compila sin errores (`npm run build`).
- [ ] El linter pasa sin errores (`npm run lint`).
- [ ] Los tests pasan (`npm run test`).
- [ ] Swagger refleja los endpoints nuevos (si aplica).
- [ ] `TASKS.md` está actualizado con las tareas completadas.
- [ ] No se suben archivos `.env` ni credenciales.
