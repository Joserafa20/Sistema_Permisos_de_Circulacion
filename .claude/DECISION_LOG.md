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

## ADR-015 — 2026-08-02

### Título

TypeORM 0.3 como ORM oficial del proyecto

### Estado

Aceptado

### Contexto

El sistema requiere una capa de acceso a datos que:

1. Sea compatible con PostgreSQL 15 y sus características nativas (ENUMs, UUID, JSONB, TIMESTAMPTZ, soft delete).
2. Se integre con la arquitectura hexagonal del proyecto, permitiendo que el dominio defina interfaces de repositorio (`ISolicitudRepository`, `IPermisoRepository`, etc.) y que la infraestructura las implemente sin acoplar el dominio al ORM.
3. Soporte migraciones versionadas con CLI, dado que `synchronize: true` está prohibido en todos los entornos del proyecto (ver `DATABASE.md`).
4. Se integre de forma nativa con el ecosistema NestJS (inyección de dependencias, módulos, providers).

La decisión del ORM no fue registrada en un ADR independiente durante la Fase 0. Se estableció implícitamente en ADR-001 (justificación del ecosistema NestJS) y ADR-003 (justificación de compatibilidad con PostgreSQL), y se especificó operativamente en `DATABASE.md` y `ARCHITECTURE.md`. Este ADR la formaliza con carácter retroactivo para dejarla explícita en el registro de decisiones.

### Decisión

Se adopta **TypeORM 0.3+** como ORM oficial del proyecto para toda interacción entre el backend NestJS y la base de datos PostgreSQL.

Toda operación de persistencia deberá realizarse a través de `Repository<T>` o `QueryRunner` de TypeORM. Queda prohibido el uso de SQL embebido directamente en servicios o casos de uso (ver `DATABASE.md`).

### Justificación técnica

**Integración con NestJS**
El paquete `@nestjs/typeorm` registra TypeORM en el contenedor de inyección de dependencias de NestJS. Los repositorios se inyectan directamente en servicios y casos de uso mediante el decorador `@InjectRepository(Entidad)`, sin configuración manual de instancias ni conexiones.

**Compatibilidad con arquitectura hexagonal**
TypeORM permite crear repositorios personalizados que implementan interfaces definidas en la capa de dominio (`ISolicitudRepository`, `IPermisoRepository`, etc.). Esto garantiza que el dominio no depende del ORM — solo de las interfaces que él mismo define. La implementación concreta de TypeORM reside en `infrastructure/persistence/`, respetando la inversión de dependencias establecida en `ARCHITECTURE.md`.

**Soporte de PostgreSQL 15**
TypeORM 0.3 soporta nativamente: tipos ENUM de PostgreSQL (`@Column({ type: 'enum', enum: EstadoSolicitud })`), columnas JSONB, UUID como clave primaria (`@PrimaryGeneratedColumn('uuid')`), TIMESTAMPTZ, soft delete (`@DeleteDateColumn`), y extensiones como `uuid-ossp`.

**Migraciones versionadas**
El CLI de TypeORM (`typeorm migration:generate`, `migration:run`, `migration:revert`) permite generar y ejecutar migraciones TypeScript versionadas. Esto cumple el requerimiento del proyecto de nunca usar `synchronize: true`, mantener un historial completo de cambios al esquema y soportar rollbacks controlados.

**Madurez y ecosistema**
TypeORM es la solución de persistencia históricamente asociada al ecosistema NestJS. Todas las guías oficiales de NestJS, la documentación de `@nestjs/typeorm` y los proyectos de referencia están construidos sobre TypeORM. Esto reduce la fricción durante el desarrollo y el onboarding de nuevos desarrolladores.

### Alternativas evaluadas

**Prisma**

Prisma ofrece un generador de cliente con tipos extremadamente precisos derivados del schema (`schema.prisma`). Su DX (Developer Experience) es reconocida como superior en proyectos donde el esquema se define en el archivo Prisma y el cliente se genera automáticamente.

Sin embargo, presenta tres incompatibilidades con los requisitos de este proyecto:

1. **Arquitectura hexagonal:** Prisma Client no es un repositorio inyectable en el sentido de NestJS. Para usar Prisma con arquitectura hexagonal se requiere envolver el cliente en un servicio adicional (`PrismaService`) y luego en adaptadores de repositorio por entidad, aumentando la complejidad de la capa de infraestructura sin beneficio funcional.

2. **Tipos ENUM nativos de PostgreSQL:** Prisma modela los ENUMs en su propio `schema.prisma` y los mapea a ENUMs de PostgreSQL, pero el control granular sobre los tipos nativos (nombre del tipo SQL, valor por defecto en la BD, migración incremental) es más limitado que TypeORM. El proyecto requiere 5 ENUMs nativos con nombres específicos usados tanto en el ORM como en scripts SQL directos.

3. **Migraciones en sistemas existentes:** El modelo de migraciones de Prisma (`prisma migrate`) está optimizado para proyectos que inician desde cero con Prisma. La coexistencia con scripts SQL manuales (`database/schema.sql`) y con la extensión `uuid-ossp` inicializada externamente (en `docker/postgres/init.sql`) introduce complejidad adicional.

**Decisión sobre Prisma:** No adoptado. Las ventajas de DX no compensan la incompatibilidad con los tres requisitos estructurales del proyecto.

**MikroORM**

MikroORM tiene mejor soporte de Unit of Work y un modelo de identidad más riguroso que TypeORM. Sin embargo, su integración con NestJS (`@mikro-orm/nestjs`) es menos madura, su comunidad es considerablemente más pequeña, y la documentación de referencia del ecosistema NestJS no lo cubre como opción principal. No fue evaluado como alternativa viable dado el contexto del proyecto.

**SQL nativo con `pg`**

Descartado. El uso de SQL embebido directamente en servicios viola el principio de abstracción de persistencia requerido por la arquitectura hexagonal y hace los tests de unidad significativamente más complejos (no hay repositorios mockeables).

### Consecuencias

**Positivas:**
- Repositorios inyectables mediante `@InjectRepository()`, compatibles con el sistema DI de NestJS.
- Entidades TypeScript como única fuente de verdad del esquema (junto con las migraciones).
- Soporte completo de las características PostgreSQL 15 requeridas por `DATABASE.md`.
- CLI de migraciones integrado: `typeorm migration:generate | run | revert`.
- Tests unitarios simplificados: los repositorios se mockean mediante el token de inyección.

**Restricciones derivadas:**
- `synchronize: false` obligatorio en todos los entornos (desarrollo, test, producción). Cualquier cambio de esquema debe hacerse a través de una migración generada y revisada.
- Las entidades TypeORM residen exclusivamente en `infrastructure/persistence/`. Las entidades de dominio (en `domain/entities/`) son clases POJO sin decoradores de ORM.
- Toda consulta compleja debe hacerse con `QueryBuilder` de TypeORM, nunca con SQL embebido en un servicio.
- Las migraciones se versionan en `backend/src/database/migrations/` y se ejecutan automáticamente en el arranque del contenedor de test.

### Referencias

- `DATABASE.md` — Sección "ORM": establece TypeORM con migraciones versionadas como mandato operativo.
- `ARCHITECTURE.md` — Stack Tecnológico Completo: lista TypeORM 0.3+ en la tabla de tecnologías del backend.
- `ARCHITECTURE.md` — Capas por Módulo: define `infrastructure/persistence/ ← TypeORM entities, repositories, migrations`.
- ADR-001: justificación de NestJS menciona TypeORM como parte del ecosistema que motivó la elección.
- ADR-003: justificación de PostgreSQL menciona "compatibilidad con TypeORM 0.3".

---

## ADR-016 — 2026-08-02

### Título

Jerarquía de autoridad entre artefactos del modelo de datos

### Estado

Aceptado

### Contexto

El sistema define su modelo de datos en múltiples artefactos que deben mantenerse coherentes entre sí:

1. `docs/MODELO_DATOS.md` — especificación funcional del esquema, tipos, constraints e índices.
2. Entidades TypeORM (`infrastructure/persistence/*.entity.ts`) — representación en código del esquema.
3. Migraciones TypeORM (`database/migrations/`) — cambios versionados al esquema de BD.
4. `database/schema.sql` — script SQL autocontenido para inicializar la base de datos.

Durante la implementación de las entidades TypeORM en la Fase 1 se detectó una inconsistencia concreta: `MODELO_DATOS.md` define la columna `hash_pdf VARCHAR(64)` en la tabla `permisos`, pero la `PermisoEntity` implementada no incluye esa columna. Este caso demostró que sin una jerarquía explícita, las inconsistencias pueden propagarse silenciosamente entre artefactos.

### Decisión

Se establece el siguiente orden de prioridad entre los artefactos del modelo de datos:

1. **`docs/MODELO_DATOS.md`** — es la fuente de verdad. Toda discrepancia se resuelve contra este documento.
2. **Entidades TypeORM** — deben reflejar exactamente `MODELO_DATOS.md`. Ninguna columna, tipo o constraint puede diferir sin una modificación previa y aprobada de `MODELO_DATOS.md`.
3. **Migraciones** — se generan a partir de las entidades. No pueden introducir columnas o constraints no definidos en `MODELO_DATOS.md`.
4. **`database/schema.sql`** — se genera a partir de `MODELO_DATOS.md` directamente. Debe ser coherente con las entidades pero no es la fuente de verdad.

Ningún artefacto puede modificar el modelo de datos de forma independiente.

Si durante el desarrollo se detecta una inconsistencia entre estos artefactos, la implementación debe detenerse y presentar la diferencia al usuario para su aprobación antes de continuar.

**No está permitido corregir automáticamente una inconsistencia estructural.**

### Justificación técnica

- Una inconsistencia no detectada entre entidades y esquema SQL puede causar que las migraciones TypeORM generen DDL incorrecto, produciendo discrepancias entre el esquema en código y el esquema real en la base de datos.
- El orden de prioridad refleja la naturaleza de cada artefacto: `MODELO_DATOS.md` es diseño, las entidades son implementación, las migraciones son historia incremental, y el SQL es reproducibilidad.
- La prohibición de corrección automática evita que inconsistencias en `MODELO_DATOS.md` se propaguen silenciosamente hacia abajo en la cadena de artefactos sin revisión explícita del responsable del proyecto.

### Consecuencias

- Todo cambio al esquema de datos debe iniciarse modificando `MODELO_DATOS.md`.
- Toda inconsistencia detectada genera una pausa obligatoria y un reporte al usuario.
- La columna `hash_pdf` en `permisos` (inconsistencia R-01 identificada en el análisis del Script SQL) deberá resolverse con aprobación explícita del usuario antes de implementar las migraciones.

### Referencias

- `DATABASE.md` — sección "Regla de Consistencia del Modelo" (política operativa derivada de este ADR).
- `docs/MODELO_DATOS.md` — §7.1 `permisos`: define `hash_pdf VARCHAR(64)`.
- `PermisoEntity` — `backend/src/modules/permisos/infrastructure/persistence/permiso.entity.ts`.

---

## ADR-017 — 2026-08-02

### Título

Parametrización Institucional para Reutilización del Sistema entre Alcaldías

### Estado

Aceptado

### Contexto

El sistema fue inicialmente concebido para una alcaldía específica, con ciertos datos institucionales (nombre de la alcaldía, municipio, logo) almacenados como parámetros clave-valor en la tabla `configuracion`. Este enfoque presenta tres limitaciones:

1. **Acoplamiento implícito:** Los módulos de generación de PDF, correos institucionales y el portal ciudadano leen de claves específicas en `configuracion` (`nombre_alcaldia`, `municipio`, `logo_url`), creando un acoplamiento invisible entre la tabla de parámetros operativos y la identidad institucional.

2. **Sin estructura ni validación:** Al ser clave-valor no tipado, no hay constraint que obligue a que `nombre_alcaldia` exista y sea no vacío antes de emitir un permiso PDF. Cualquier clave faltante produce un PDF incorrecto o una excepción en runtime.

3. **No reutilizable:** Una instalación en otra alcaldía requiere intervención técnica para identificar y actualizar todas las claves dispersas en `configuracion` que contienen datos institucionales.

### Decisión

Se introduce una nueva entidad `configuracion_institucional` en el modelo de datos — una tabla singleton (un único registro por instalación) que centraliza toda la información de identidad institucional:

- **Información General:** nombre oficial, NIT, código DANE, departamento, municipio.
- **Información de Contacto:** dirección, teléfono, correo institucional, sitio web.
- **Identidad Visual:** escudo oficial (obligatorio), logo institucional (opcional).

Las claves `nombre_alcaldia`, `municipio` y `logo_url` de la tabla `configuracion` quedan **deprecadas** y serán eliminadas en la migración que cree la tabla `configuracion_institucional` (programada para Fase 2).

Todo módulo que necesite datos institucionales deberá leerlos desde `configuracion_institucional`, no desde `configuracion`.

### Justificación técnica

- **Reutilización:** Cualquier alcaldía de Colombia puede instalar el sistema y configurar su identidad institucional a través de la interfaz de administrador, sin modificar una sola línea de código.
- **Estructura y validación:** Las columnas tienen tipos y constraints explícitos en PostgreSQL (`NOT NULL` donde es obligatorio, `VARCHAR` con límites, `FK` hacia `usuarios`). Un registro incompleto no puede persistirse.
- **Integridad documental:** Al ser un registro con estructura fija, el `PDFModule` puede fallar con error descriptivo (`ESCUDO_NO_DISPONIBLE`) si la imagen obligatoria no está disponible, en lugar de generar silenciosamente un PDF sin escudo.
- **Separación de responsabilidades:** `configuracion` gestiona parámetros operativos (plazos, límites numéricos, colores). `configuracion_institucional` gestiona identidad. Son dominios distintos.
- **Auditoría:** Todo cambio a la configuración institucional queda registrado en `auditoria` con valores anteriores y nuevos, lo que no era posible con el enfoque clave-valor (se registraba solo la clave modificada, no la imagen anterior).

### Impacto

| Módulo | Impacto |
|--------|---------|
| `docs/MODELO_DATOS.md` | Nueva entidad §9.3 `configuracion_institucional` |
| `docs/PRD_*.md` | Nuevo módulo documentado |
| `docs/REGLAS_NEGOCIO.md` | RN-101 a RN-108 agregadas |
| `docs/HISTORIAS_USUARIO.md` | É-09, HU-44 a HU-47 agregadas |
| `docs/CASOS_USO.md` | Módulo 6, CU-42 a CU-45 agregados |
| `.claude/API.md` | Nuevos endpoints documentados |
| `.claude/SECURITY.md` | Matriz RBAC actualizada |
| `database/` | Nueva migración TypeORM — Fase 2 |
| `backend/src/modules/configuracion-institucional/` | Nuevo módulo NestJS — Fase 2 |
| `frontend/` | Nueva pantalla de administración — Fase 7 |
| `backend/database/seeds/seed.ts` | Nuevo seed para `configuracion_institucional` — Fase 2 |
| `backend/.env.example` | Nuevas variables SEED_CI_* — Fase 2 |

### Consecuencias

- **Positivas:** Reutilización inmediata entre alcaldías. Validación estructural de la identidad. PDF siempre contiene datos completos o falla explícitamente.
- **Restricciones derivadas:** Los servicios de PDF y notificaciones deben actualizarse para leer de `configuracion_institucional` en lugar de `configuracion`. La migración de Fase 2 debe eliminar las claves deprecadas de `configuracion` coordinadamente.

### Referencias

- `docs/MODELO_DATOS.md` — §9.3 `configuracion_institucional`
- `docs/REGLAS_NEGOCIO.md` — RN-101 a RN-108

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

NestJS CLI v10 aún genera proyectos con `.eslintrc.json`. La migración a flat config de ESLint es un breaking change que requiere reescribir la configuración a formato `eslint.config.js`. No es crítico en Fase 0 porque no existen archivos de lógica de negocio.

### Impacto adicional registrado — 2026-08-02

El paso `eslint --fix --max-warnings=0` en lint-staged fue eliminado de `package.json` (raíz del monorepo) como desbloqueador de la Fase 1. Dos causas combinadas:

1. `eslint` no está en PATH en Windows; el binario está en `backend/node_modules/.bin/`.
2. HAL-004: incluso con path correcto, ESLint v9 + `.eslintrc.json` retorna exit 0 sin lintear.

El paso era un no-op en la práctica. **Deuda técnica activa.**

### Acción pendiente — fecha límite: antes del inicio de Fase 2

1. Migrar `backend/.eslintrc.json` → `backend/eslint.config.js` (flat config ESLint v9).
2. Actualizar lint-staged en `package.json` para usar ruta local:
   `"./backend/node_modules/.bin/eslint --fix --max-warnings=0"` o via `npx`.
3. Verificar que el hook rechace archivos con errores de lint antes de permitir el commit.

### Fase de resolución

Antes del inicio de Fase 2 — Autenticación y Seguridad.

---

# Instrucciones para Claude Code

Antes de modificar una decisión existente:

1. Revisar este documento.
2. Verificar si la decisión continúa vigente.
3. Si se requiere un cambio, registrar una nueva entrada explicando el motivo.
4. Nunca eliminar decisiones anteriores; conservar el historial para auditoría.
