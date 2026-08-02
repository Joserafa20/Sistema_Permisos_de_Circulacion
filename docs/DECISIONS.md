# Decisiones de Arquitectura — Sistema de Permisos de Circulación (Pico y Placa)

**Formato:** Architecture Decision Record (ADR)  
**Versión:** 1.0  
**Fecha:** 2026-08-02

> Este documento registra todas las decisiones de arquitectura relevantes del proyecto. Cada decisión incluye el contexto que la motivó, las alternativas evaluadas, la decisión tomada y su impacto. Este registro permite al equipo entender el razonamiento detrás de las elecciones técnicas y facilita la incorporación de nuevos miembros.

---

## Índice de Decisiones

| Código | Decisión | Fecha | Estado |
|--------|---------|-------|--------|
| [ADR-001](#adr-001) | Uso de NestJS como framework backend | 2026-08-02 | Activa |
| [ADR-002](#adr-002) | Uso de Next.js como framework frontend | 2026-08-02 | Activa |
| [ADR-003](#adr-003) | Uso de PostgreSQL como base de datos | 2026-08-02 | Activa |
| [ADR-004](#adr-004) | Uso de JWT para autenticación | 2026-08-02 | Activa |
| [ADR-005](#adr-005) | Documentación de API con Swagger/OpenAPI | 2026-08-02 | Activa |
| [ADR-006](#adr-006) | Adopción de Arquitectura Hexagonal | 2026-08-02 | Activa |
| [ADR-007](#adr-007) | Uso de UUID v4 como identificador de entidades | 2026-08-02 | Activa |
| [ADR-008](#adr-008) | Uso de Docker y Docker Compose para contenedorización | 2026-08-02 | Activa |
| [ADR-009](#adr-009) | Código QR como mecanismo de verificación del permiso | 2026-08-02 | Activa |

---

## ADR-001

### Uso de NestJS como Framework Backend

| Campo | Valor |
|-------|-------|
| **Código** | ADR-001 |
| **Fecha** | 2026-08-02 |
| **Estado** | Activa |
| **Responsable** | Arquitecto de Software / Tech Lead |

#### Contexto

El sistema requiere una API REST robusta en Node.js que soporte:
- Arquitectura modular para un equipo de 2-3 desarrolladores.
- Integración con TypeORM para PostgreSQL.
- Soporte nativo de inyección de dependencias para implementar la arquitectura hexagonal.
- Generación automática de documentación Swagger.
- Procesamiento asíncrono con BullMQ.
- Guards y decoradores personalizados para RBAC.
- TypeScript de primera clase.

#### Problema

¿Qué framework de Node.js usar para el backend de un sistema institucional con requisitos de estructura, seguridad y documentación?

#### Alternativas Evaluadas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| **NestJS** | Arquitectura modular out-of-the-box. DI nativo. TypeScript first. Swagger integrado. Ecosistema maduro (BullMQ, TypeORM, Passport). | Curva de aprendizaje moderada. Más verboso que Express. |
| **Express.js** | Minimalista, amplio ecosistema, muy conocido. | Sin estructura impuesta. Requiere configurar todo manualmente. DI manual. Más propenso a inconsistencias en equipos pequeños. |
| **Fastify** | Muy rápido, buen soporte de TypeScript. | Menor ecosistema que Express/NestJS. Integración con TypeORM y Passport menos documentada. |
| **Hapi.js** | Robusto para APIs empresariales. | Ecosistema más pequeño. Menor adopción en Colombia. Curva de aprendizaje alta. |

#### Decisión Tomada

**NestJS.**

#### Justificación

NestJS es la opción que mejor se alinea con los requisitos del proyecto:

1. **Arquitectura modular nativa:** Cada dominio (solicitudes, permisos, usuarios) es un módulo independiente. Facilita la distribución del trabajo y el mantenimiento.
2. **Inyección de dependencias:** Esencial para implementar la Arquitectura Hexagonal (ADR-006). Los use cases dependen de interfaces, no de implementaciones concretas.
3. **TypeScript de primera clase:** Obligatorio según las convenciones del proyecto (CLAUDE.md).
4. **Swagger integrado:** `@nestjs/swagger` genera documentación automática a partir de decoradores, con mínima configuración adicional.
5. **Ecosistema oficial:** `@nestjs/bullmq`, `@nestjs/passport`, `@nestjs/typeorm`, `@nestjs/throttler` son paquetes mantenidos por el mismo equipo.
6. **Adoption empresarial:** Ampliamente usado en entidades gubernamentales y empresas colombianas. Facilita encontrar desarrolladores con experiencia.

#### Impacto

- **Positivo:** Estructura consistente, onboarding más rápido para nuevos desarrolladores, reducción de decisiones de arquitectura a bajo nivel.
- **Negativo:** El boilerplate inicial es mayor que Express. Para APIs muy simples sería excesivo (pero este no es el caso).
- **En el proyecto:** Todos los controladores, servicios, repositorios y use cases usan la convención de módulos de NestJS. Ver `.claude/ARCHITECTURE.md` para la lista de módulos.

---

## ADR-002

### Uso de Next.js como Framework Frontend

| Campo | Valor |
|-------|-------|
| **Código** | ADR-002 |
| **Fecha** | 2026-08-02 |
| **Estado** | Activa |
| **Responsable** | Arquitecto de Software / Tech Lead |

#### Contexto

El sistema requiere tres interfaces distintas compartiendo la misma base de código:
1. **Portal ciudadano** (público, sin auth, optimizado para móvil y SEO).
2. **Panel de funcionario** (autenticado, flujos de trabajo complejos).
3. **Panel de administrador** (autenticado, alto privilegio).

Adicionalmente, la página de validación del QR debe ser pública, extremadamente rápida y funcionar bien en conexiones móviles lentas.

#### Problema

¿Qué framework React usar para construir múltiples interfaces con diferentes requisitos de acceso y rendimiento en una sola aplicación?

#### Alternativas Evaluadas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| **Next.js** | App Router con layouts por grupo. SSR/SSG nativo. TypeScript integrado. TailwindCSS compatible. Middleware de autenticación. Route groups para separar portales. Vercel deployment si se necesita nube. | Complejidad del App Router para equipos nuevos. |
| **Create React App** | Simple, conocido. | Sin SSR. Sin routing integrado. Descontinuado. |
| **Vite + React** | Muy rápido en desarrollo. | Sin SSR. Routing y auth manual. |
| **Remix** | Excelente manejo de formularios y loaders. | Menor adopción. Menos material de referencia en español. |
| **SvelteKit** | Rendimiento excelente. | Lenguaje diferente. No es React (el equipo tiene experiencia en React). |

#### Decisión Tomada

**Next.js 14 con App Router.**

#### Justificación

1. **Route Groups:** El App Router de Next.js 14 permite organizar rutas en grupos `(public)`, `(auth)`, `funcionario/`, `admin/` con layouts independientes. Un solo repositorio, tres portales.
2. **SSR para el portal ciudadano:** La página pública y la página de validación QR se renderizan en el servidor, lo que mejora el tiempo de primera carga en conexiones móviles lentas (común en Colombia).
3. **Middleware de autenticación:** El middleware de Next.js puede proteger rutas completas antes de que el componente se cargue, evitando flashes de contenido no autorizado.
4. **TypeScript nativo:** Compatible con el requisito del proyecto.
5. **TailwindCSS:** Soporte oficial de Next.js.
6. **SEO para el portal ciudadano:** El portal público debe ser indexable por Google para que los ciudadanos lo encuentren fácilmente.

#### Impacto

- **Positivo:** Un solo repositorio para todo el frontend. SSR mejora la experiencia del ciudadano. Route groups separan responsabilidades claramente.
- **Negativo:** El App Router tiene una curva de aprendizaje para equipos acostumbrados al Pages Router.
- **En el proyecto:** Estructura de directorios en `frontend/src/app/`. Ver `.claude/ARCHITECTURE.md`.

---

## ADR-003

### Uso de PostgreSQL como Base de Datos

| Campo | Valor |
|-------|-------|
| **Código** | ADR-003 |
| **Fecha** | 2026-08-02 |
| **Estado** | Activa |
| **Responsable** | DBA / Arquitecto de Software |

#### Contexto

El sistema maneja datos transaccionales de trámites gubernamentales con requisitos de:
- Integridad referencial (FK entre solicitudes, ciudadanos, permisos, etc.).
- Tipos de datos avanzados (UUID, JSONB para snapshots y auditoría, TIMESTAMPTZ, ENUM nativos).
- Particionamiento para la tabla de auditoría (millones de registros en 5 años).
- Transacciones ACID para operaciones críticas (aprobar solicitud = crear historial + auditoria + encolar job).
- Consultas analíticas para reportes.
- Extensiones: `uuid-ossp`, `pg_stat_statements`, `unaccent`.

#### Problema

¿Qué sistema de base de datos relacional usar para un sistema institucional con requisitos de integridad, auditoría y escala moderada?

#### Alternativas Evaluadas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| **PostgreSQL** | ACID completo. JSONB nativo. ENUM nativo. Particionamiento. Full-text search. Open source. Ampliamente soportado por TypeORM. | Requiere más configuración inicial que SQLite. |
| **MySQL / MariaDB** | Muy conocido, hosting barato. | JSONB menos maduro. ENUMs menos flexibles. Transacciones menos robustas. |
| **SQLite** | Cero configuración. | Sin concurrencia real. No apto para producción multi-usuario. |
| **MongoDB** | Esquema flexible. | Sin joins nativos. Sin ACID transaccional completo entre documentos. Modelo de permisos institucionales no encaja bien con documentos. |
| **Microsoft SQL Server** | Muy maduro. | Licencia costosa. No alineado con el stack open source. |

#### Decisión Tomada

**PostgreSQL 15+.**

#### Justificación

1. **JSONB nativo:** Esencial para los campos `snapshot_ciudadano`, `snapshot_motocicleta`, `datos_anteriores` y `datos_nuevos` en auditoría.
2. **ENUM nativos:** Los estados de solicitudes y permisos como ENUM de PostgreSQL garantizan que solo valores válidos sean almacenados, con validación a nivel de BD.
3. **TIMESTAMPTZ:** Almacenamiento de fechas con zona horaria, crítico para un sistema que debe distinguir UTC vs COT.
4. **Particionamiento por rango:** La tabla `auditoria` con retención de 5 años requiere particionamiento para mantener el rendimiento.
5. **TypeORM:** Soporte maduro de TypeORM con PostgreSQL, incluyendo migraciones automáticas.
6. **Open source y gratuito:** Alineado con el enfoque de la alcaldía de minimizar costos de licencias.

#### Impacto

- **Positivo:** Integridad de datos garantizada a nivel de base de datos. Tipos de datos avanzados reducen la lógica de validación en la aplicación.
- **Negativo:** Requiere configuración adecuada de `max_connections`, `shared_buffers` y autovacuum para producción.
- **En el proyecto:** 17 tablas, 5 ENUMs nativos, 25 índices, particionamiento en `auditoria`. Ver `docs/MODELO_DATOS.md`.

---

## ADR-004

### Uso de JWT para Autenticación

| Campo | Valor |
|-------|-------|
| **Código** | ADR-004 |
| **Fecha** | 2026-08-02 |
| **Estado** | Activa |
| **Responsable** | Arquitecto de Seguridad / Tech Lead |

#### Contexto

El sistema tiene tres niveles de acceso:
1. **Público (ciudadano):** Sin autenticación. Identificación por radicado + documento.
2. **Funcionario:** Autenticación requerida para gestionar solicitudes.
3. **Administrador:** Autenticación requerida con verificación de rol.

El sistema es una API REST con frontend desacoplado (SPA/Next.js). No hay sesiones de servidor tradicionales.

#### Problema

¿Qué mecanismo de autenticación usar para la API REST en un sistema sin sesiones de servidor?

#### Alternativas Evaluadas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| **JWT (Access + Refresh Token)** | Stateless para el access token. No requiere consulta a BD en cada request. Fácil integración con NestJS Passport. Estándar de la industria para APIs REST. | El access token no puede ser revocado antes de expirar (mitigado con TTL corto). |
| **Session con cookie** | Revocación inmediata. Protección CSRF integrada. | Requiere estado en el servidor (Redis/BD). Más complejo para un frontend desacoplado. |
| **OAuth 2.0 (con proveedor externo)** | SSO con cuentas de gobierno. | Dependencia de un proveedor externo. Configuración compleja. Puede no estar disponible para la alcaldía. |
| **API Keys** | Simple para integraciones M2M. | No apto para autenticación de usuarios. Sin expiración natural. |

#### Decisión Tomada

**JWT con par Access Token (15 min) + Refresh Token (7 días) con rotación.**

#### Justificación

1. **Access Token corto (15 min):** Minimiza el impacto si un token es comprometido. El atacante tiene una ventana muy pequeña de acceso.
2. **Refresh Token con rotación:** Cada vez que se usa el refresh token, se emite uno nuevo y el anterior queda revocado. Si un refresh token robado es usado, el sistema lo detecta (el token original ya fue marcado como revocado por el usuario legítimo) y puede revocar todos los tokens del usuario.
3. **Revocación en Redis:** Los refresh tokens revocados se almacenan en Redis con TTL igual al tiempo restante del token. Esto permite revocar sesiones sin consultar la BD en cada request del access token.
4. **Stateless para el access token:** La API no necesita consultar la BD para validar el access token. Solo verifica la firma JWT. Esto escala bien bajo carga.
5. **NestJS Passport:** Integración oficial con `@nestjs/passport` y `passport-jwt`.

#### Impacto

- **Positivo:** Arquitectura stateless escalable. Logout inmediato con revocación del refresh token. Rotación de tokens previene replay attacks.
- **Negativo:** El access token de 15 min no puede ser revocado inmediatamente. Si un administrador es desactivado, tiene hasta 15 min de acceso residual.
- **Mitigación del impacto negativo:** En la desactivación de usuarios, además de revocar el refresh token, el sistema puede agregar el access token actual a una blocklist en Redis (TTL de 15 min).
- **En el proyecto:** Ver `.claude/SECURITY.md` para detalles de implementación.

---

## ADR-005

### Documentación de API con Swagger/OpenAPI

| Campo | Valor |
|-------|-------|
| **Código** | ADR-005 |
| **Fecha** | 2026-08-02 |
| **Estado** | Activa |
| **Responsable** | Tech Lead |

#### Contexto

El sistema tiene 56+ endpoints REST distribuidos en 14 módulos. El frontend y el backend son desarrollados potencialmente por personas diferentes del equipo. Además, la alcaldía puede requerir integrar el sistema con otros sistemas gubernamentales en el futuro.

#### Problema

¿Cómo documentar la API REST de forma que sea mantenible, siempre actualizada y útil para el equipo y para integraciones futuras?

#### Alternativas Evaluadas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| **Swagger (OpenAPI 3.0)** | Estándar de la industria. UI interactiva. Generación automática con NestJS. Permite probar endpoints directamente. Exportable para Postman. | Requiere decoradores en el código. |
| **Documentación manual (Markdown)** | Sin setup. | Se desactualiza rápidamente. No es interactiva. |
| **Postman Collection** | Fácil de compartir. | No auto-generado. Se desactualiza. |
| **GraphQL Playground** | Auto-documentado. | Requiere cambiar el paradigma de API a GraphQL (fuera del alcance). |

#### Decisión Tomada

**Swagger (OpenAPI 3.0) con `@nestjs/swagger`.**

#### Justificación

1. **Convención del proyecto:** CLAUDE.md establece explícitamente: *"Documentar todas las APIs con Swagger."*
2. **Auto-generado:** Los decoradores en los controladores y DTOs generan la documentación automáticamente. Siempre sincronizada con el código.
3. **UI interactiva:** `/api/docs` permite probar los endpoints directamente desde el navegador durante el desarrollo.
4. **Exportable:** El JSON de Swagger se puede importar en Postman, Insomnia o cualquier herramienta de testing de API.
5. **Integración futura:** Un estándar OpenAPI 3.0 facilita futuras integraciones con sistemas de la gobernación o del RUNT.

#### Impacto

- **Positivo:** Documentación siempre actualizada sin esfuerzo adicional significativo. Onboarding más rápido para nuevos desarrolladores.
- **Negativo:** Requiere añadir decoradores a todos los controladores y DTOs. Puede añadir verbosidad al código.
- **En el proyecto:** Swagger disponible en `/api/docs`. No exponer en producción sin autenticación básica.

---

## ADR-006

### Adopción de Arquitectura Hexagonal

| Campo | Valor |
|-------|-------|
| **Código** | ADR-006 |
| **Fecha** | 2026-08-02 |
| **Estado** | Activa |
| **Responsable** | Arquitecto de Software Senior |

#### Contexto

El sistema es de naturaleza institucional, lo que implica:
- **Longevidad:** El sistema puede estar en producción por 5-10 años.
- **Cambio de infraestructura:** El proveedor de correo, el storage o incluso la base de datos pueden cambiar.
- **Testabilidad:** La lógica de negocio debe probarse sin levantar una base de datos real.
- **Equipo cambiante:** Los desarrolladores del sistema pueden rotar.

#### Problema

¿Qué estilo arquitectónico aplicar para garantizar que la lógica de negocio sea independiente del framework, la base de datos y los servicios externos?

#### Alternativas Evaluadas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| **Arquitectura Hexagonal** | Lógica de dominio independiente. Altamente testeable. Cambio de infraestructura sin afectar el negocio. | Mayor complejidad inicial. Más archivos. |
| **MVC Clásico (NestJS Service Layer)** | Simple, bien conocido. Rápido de implementar. | La lógica de negocio tiende a mezclarse con la infraestructura. Difícil de testear sin mocks de BD. |
| **CQRS + Event Sourcing** | Muy escalable. Historial completo de cambios. | Complejidad excesiva para el tamaño del sistema. |
| **Clean Architecture** | Similar a Hexagonal pero más formal. | Diferencias mínimas para el tamaño del sistema. |

#### Decisión Tomada

**Arquitectura Hexagonal (Ports & Adapters).**

#### Justificación

1. **Testabilidad:** Los use cases (lógica de negocio) no dependen de TypeORM ni de NestJS. Se pueden probar con mocks simples de los repositorios.
2. **Independencia del framework:** Si NestJS cambia radicalmente o el equipo decide migrar, la lógica de dominio y aplicación no cambia.
3. **Independencia del ORM:** Cambiar de TypeORM a Prisma, o de PostgreSQL a otro motor, solo requiere implementar los adaptadores, no tocar los use cases.
4. **Independencia del storage:** Cambiar de MinIO a AWS S3 es implementar `IStoragePort` con el nuevo adaptador.
5. **Requisito del PRD:** CLAUDE.md establece explícitamente: *"Arquitectura Hexagonal."*

#### Impacto

- **Positivo:** Sistema altamente testeable y mantenible a largo plazo. Cambios de infraestructura con impacto mínimo.
- **Negativo:** Mayor cantidad de archivos y capas. La curva de aprendizaje inicial es más pronunciada. No todos los desarrolladores están familiarizados con este patrón.
- **En el proyecto:** Estructura `domain/`, `application/`, `infrastructure/`. Ver `.claude/ARCHITECTURE.md` para los puertos y adaptadores definidos.

---

## ADR-007

### Uso de UUID v4 como Identificador de Entidades

| Campo | Valor |
|-------|-------|
| **Código** | ADR-007 |
| **Fecha** | 2026-08-02 |
| **Estado** | Activa |
| **Responsable** | DBA / Arquitecto de Software |

#### Contexto

Todas las entidades del sistema necesitan un identificador único. El sistema puede necesitar ser consultado desde múltiples fuentes (portal ciudadano, panel funcionario, panel admin, verificación QR), lo que hace importante que los IDs no revelen información sobre el volumen o secuencia de registros.

#### Problema

¿Qué tipo de identificador usar para las entidades del sistema?

#### Alternativas Evaluadas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| **UUID v4** | Globalmente único. No predecible. No revela información de secuencia. Estándar para APIs REST. Generado en la aplicación sin consultar BD. | Mayor tamaño (36 chars vs 4-8 bytes int). Índices ligeramente más grandes. |
| **SERIAL / BIGSERIAL** | Compacto. Eficiente para joins. | Predecible (ataque de enumeración). Revela el volumen total de registros. No apto para URLs públicas (IDOR). |
| **UUID v7** | Ordenable por tiempo. Mejor performance de índices que v4. | Menos soporte en la extensión `uuid-ossp` de PostgreSQL. Más nuevo, menos adopción. |
| **NanoID** | Más corto que UUID. URL-friendly. | Sin soporte nativo en PostgreSQL. Requiere gestión en la aplicación. |

#### Decisión Tomada

**UUID v4 generado por PostgreSQL con `gen_random_uuid()` (o `uuid_generate_v4()` de la extensión `uuid-ossp`).**

#### Justificación

1. **Seguridad:** Un atacante no puede enumerar registros usando IDs secuenciales (IDOR prevention). Ejemplo: `/solicitudes/1` revela que existe una solicitud 1; `/solicitudes/uuid` no revela nada.
2. **Globalidad:** Los UUIDs son únicos globalmente. Si el sistema se integra con otros sistemas en el futuro, los IDs no colisionan.
3. **Generación en BD:** `gen_random_uuid()` es una función nativa de PostgreSQL 13+, sin dependencias adicionales.
4. **Convención del proyecto:** CLAUDE.md establece: *"Generar QR único para cada permiso"* y el número de radicado tiene su propio formato. Los IDs internos de las entidades usan UUID.

#### Impacto

- **Positivo:** Sin enumeración de recursos. IDs únicos a nivel global.
- **Negativo:** Los UUIDs son más largos en los logs y más difíciles de comunicar verbalmente. Los índices PRIMARY KEY son ligeramente más grandes que con SERIAL.
- **Mitigación:** El número de radicado (`20260802-PYP-000123`) y el código de permiso (`2026-PYP-00145`) son los identificadores amigables para humanos. Los UUIDs son para uso interno del sistema.

---

## ADR-008

### Uso de Docker y Docker Compose para Contenedorización

| Campo | Valor |
|-------|-------|
| **Código** | ADR-008 |
| **Fecha** | 2026-08-02 |
| **Estado** | Activa |
| **Responsable** | Tech Lead / DevOps |

#### Contexto

El equipo de desarrollo tiene diversidad de sistemas operativos (Windows, macOS, Linux). Los ambientes de desarrollo deben ser reproducibles. El sistema tiene múltiples servicios (PostgreSQL, Redis, MinIO) que deben estar disponibles para el desarrollo sin instalación manual.

#### Problema

¿Cómo garantizar que el ambiente de desarrollo es reproducible y consistente con el ambiente de producción?

#### Alternativas Evaluadas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| **Docker + Docker Compose** | Reproducible. Multi-OS. Aislado. Declarativo. Estándar de la industria. Mismo entorno en dev y producción. | Docker Desktop en Windows/Mac requiere licencia para empresas grandes. |
| **Instalación local manual** | Sin overhead de Docker. | No reproducible. Difiere entre sistemas operativos. Configuración manual propensa a errores. |
| **Vagrant** | VM completa, muy aislado. | Lento. Recursos pesados. Menos ergonómico que Docker. |
| **Kubernetes local (minikube)** | Más cercano a producción en nube. | Excesivamente complejo para el tamaño del equipo. |
| **Dev Containers (VS Code)** | Muy integrado con VS Code. | Dependencia de VS Code. No estándar para todos los IDEs. |

#### Decisión Tomada

**Docker Engine + Docker Compose v2.**

#### Justificación

1. **Reproducibilidad:** `docker compose up -d` levanta PostgreSQL, Redis y MinIO en cualquier sistema operativo en menos de 2 minutos.
2. **Consistencia dev-producción:** El mismo `docker-compose.prod.yml` con multi-stage builds garantiza que la imagen de producción es la misma que se probó.
3. **Aislamiento:** Los servicios de infraestructura no contaminan el sistema operativo del desarrollador.
4. **Multi-stage builds:** Permite crear imágenes de producción optimizadas (sin herramientas de compilación).
5. **Ecosistema maduro:** Documentación abundante, amplio soporte de la comunidad.

#### Impacto

- **Positivo:** Onboarding de nuevos desarrolladores en minutos. Eliminación de "funciona en mi máquina".
- **Negativo:** Docker Desktop requiere licencia para empresas con más de 250 empleados o ingresos mayores a $10M USD. Alternativa: usar Docker Engine directamente en Linux.
- **En el proyecto:** `docker-compose.yml` para desarrollo, `docker-compose.prod.yml` para producción. Ver `docs/PLAN_DESPLIEGUE.md` y `docs/MANUAL_TECNICO.md`.

---

## ADR-009

### Código QR como Mecanismo de Verificación del Permiso

| Campo | Valor |
|-------|-------|
| **Código** | ADR-009 |
| **Fecha** | 2026-08-02 |
| **Estado** | Activa |
| **Responsable** | Arquitecto de Software / Analista Funcional |

#### Contexto

Las autoridades de tránsito necesitan verificar en campo si un permiso presentado por un ciudadano es auténtico y está vigente. Las autoridades usan celulares personales o institucionales, y pueden estar en zonas con conexión limitada. La verificación debe ser instantánea y no requerir software adicional.

El código QR debe:
- Ser verificable con cualquier cámara de celular (sin app especial).
- Conectarse en tiempo real al sistema para obtener el estado actual.
- No revelar datos personales si alguien intercepta el código.
- Ser único e irrepetible para cada permiso.

#### Problema

¿Cómo implementar la verificación de autenticidad del permiso en campo de forma segura y accesible?

#### Alternativas Evaluadas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| **QR con URL de verificación en tiempo real** | Sin app requerida. Estado siempre actualizado. URL opaca previene enumeración. | Requiere conexión a internet en campo. |
| **QR con datos embebidos (offline)** | Funciona sin internet. | Los datos son estáticos. Si el permiso es revocado, el QR sigue mostrando "válido". |
| **QR con firma digital embebida** | Verificación offline con clave pública. | Requiere app o herramienta especial para verificar la firma. No accesible con la cámara del celular. |
| **Número de permiso manual** | Sin tecnología requerida. | Propenso a falsificación. Verificación manual lenta. Sin estado en tiempo real. |
| **NFC** | Sin necesidad de cámara. | Requiere hardware NFC (no todos los celulares). Mayor costo. |

#### Decisión Tomada

**Código QR con URL de verificación en tiempo real. El identificador en el QR es opaco (UUID + hash SHA-256).**

#### Justificación

1. **Accesibilidad universal:** Cualquier cámara de celular puede escanear un QR sin instalar apps adicionales.
2. **Estado en tiempo real:** La verificación consulta el sistema en el momento del escaneo. Si el permiso fue revocado 5 minutos antes, el QR ya muestra "REVOCADO".
3. **Identificador opaco:** El código `abc123opaco` en la URL no revela el UUID del permiso en la BD ni datos del ciudadano. No es posible enumerar permisos desde el QR.
4. **Seguridad del hash:** `SHA-256(UUID_permiso + SALT_secreto)` — sin el salt (que solo el servidor conoce), no es posible fabricar un QR válido.
5. **Registro de escaneos:** Cada escaneo queda registrado en `qr_validaciones` con IP, fecha y resultado, lo que permite detectar verificaciones inusuales.
6. **PRD explícito:** El PRD especifica la generación de QR como requisito obligatorio.

#### Impacto

- **Positivo:** Verificación instantánea, segura y accesible. Estado siempre actualizado.
- **Negativo:** Requiere conexión a internet en campo. Si el sistema está caído, la verificación QR no funciona.
- **Mitigación:** El endpoint de verificación del QR es de alta disponibilidad y puede escalarse independientemente. El ciudadano también puede mostrar el PDF descargado previamente (pero la autoridad debe saber que el PDF no actualiza su estado en tiempo real).
- **En el proyecto:** Ver `docs/MODELO_DATOS.md` (tabla `permisos.codigo_qr`), `docs/API_FUNCIONAL.md` (endpoint `GET /public/verificar/{codigoQR}`) y `.claude/ARCHITECTURE.md` (`QRModule`).

---

## Plantilla para Nuevas Decisiones

Al agregar una nueva decisión, copiar y completar la siguiente plantilla:

```markdown
## ADR-XXX

### [Título de la Decisión]

| Campo | Valor |
|-------|-------|
| **Código** | ADR-XXX |
| **Fecha** | AAAA-MM-DD |
| **Estado** | Activa / Deprecada / Reemplazada por ADR-YYY |
| **Responsable** | Nombre del rol |

#### Contexto
[Describe el contexto que hizo necesaria esta decisión]

#### Problema
[Formula el problema como una pregunta]

#### Alternativas Evaluadas
[Tabla con pros y contras de cada alternativa]

#### Decisión Tomada
[La alternativa elegida en negrita]

#### Justificación
[Por qué se tomó esta decisión y no otra]

#### Impacto
[Consecuencias positivas, negativas y mitigaciones]
```

---

*Este documento debe actualizarse cuando se tome una nueva decisión de arquitectura significativa.*  
*Una decisión es significativa si afecta la estructura, el stack, la seguridad o el modelo de datos del sistema.*
