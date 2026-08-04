# Guía de Desarrollo Backend
# Sistema de Permisos de Circulación — Pico y Placa

**Versión:** 1.0  
**Fecha de congelación:** 2026-08-02  
**Estado:** Congelado — Arquitectura Definitiva  
**Autoridad:** Arquitecto de Software Senior

---

## Índice

1. [Objetivo del Documento](#1-objetivo-del-documento)
2. [Principios Arquitectónicos](#2-principios-arquitectónicos)
3. [Estructura Oficial de Módulos](#3-estructura-oficial-de-módulos)
4. [Convenciones de Nombres](#4-convenciones-de-nombres)
5. [Convenciones de Capas](#5-convenciones-de-capas)
6. [Response Contract Oficial](#6-response-contract-oficial)
7. [Sistema Oficial de Excepciones](#7-sistema-oficial-de-excepciones)
8. [Reglas para DTO](#8-reglas-para-dto)
9. [Reglas para Controllers](#9-reglas-para-controllers)
10. [Reglas para Use Cases](#10-reglas-para-use-cases)
11. [Reglas para Repositories](#11-reglas-para-repositories)
12. [Reglas para Seguridad](#12-reglas-para-seguridad)
13. [Convenciones para Swagger](#13-convenciones-para-swagger)
14. [Convenciones para Pruebas](#14-convenciones-para-pruebas)
15. [Convenciones para Commits](#15-convenciones-para-commits)
16. [Quality Gates](#16-quality-gates)
17. [Anti-Patrones Prohibidos](#17-anti-patrones-prohibidos)
18. [Checklist de Desarrollo](#18-checklist-de-desarrollo)

---

## 1. Objetivo del Documento

### Qué es

Este documento es la **guía de arquitectura oficial y congelada** del backend del Sistema de Permisos de Circulación (Pico y Placa). Consolida en un único lugar todas las decisiones de diseño, convenciones de código y restricciones que gobiernan el desarrollo backend desde la Fase 2 hasta la Fase 8.

### Para qué sirve

- Garantizar que todos los módulos implementados por cualquier desarrollador sean **estructuralmente consistentes**.
- Eliminar ambigüedades sobre qué puede ir en cada capa.
- Servir como referencia única ante cualquier duda de implementación.
- Prevenir re-trabajo por violaciones de arquitectura descubiertas tardíamente.

### Quién debe utilizarlo

**Todos** los desarrolladores que toquen código en `backend/`. Debe ser leído completamente antes de implementar el primer endpoint de cualquier módulo.

### Qué documentos complementa

| Documento | Propósito |
|-----------|-----------|
| `docs/PRD_Sistema_Permisos_de_Circulacion.md` | Requisitos funcionales del negocio |
| `docs/API_FUNCIONAL.md` | Contrato de endpoints (qué devuelve cada endpoint) |
| `docs/MODELO_DATOS.md` | Esquema de base de datos (tablas, columnas, índices) |
| `docs/DECISIONS.md` | ADRs que justifican las decisiones de stack y arquitectura |
| `docs/REGLAS_NEGOCIO.md` | Reglas de negocio que los use cases deben hacer cumplir |
| `.claude/CLAUDE.md` | Instrucciones generales del proyecto para Claude Code |

> **Prioridad de conflictos:** `PRD > API_FUNCIONAL.md > BACKEND_DEVELOPMENT_GUIDE.md`. Si este documento contradice a los anteriores, prevalece el PRD o API_FUNCIONAL.md, y este documento debe corregirse.

---

## 2. Principios Arquitectónicos

### 2.1 Arquitectura Hexagonal (Ports & Adapters)

La arquitectura central del proyecto. Fue adoptada por la decisión **ADR-006** y es **no negociable**.

```
┌─────────────────────────────────────────────────────┐
│                  INFRAESTRUCTURA                    │
│  ┌──────────────┐         ┌───────────────────┐    │
│  │  Adaptadores │         │   Adaptadores     │    │
│  │  Entrantes   │         │   Salientes       │    │
│  │  (HTTP,      │         │   (TypeORM,       │    │
│  │   Swagger,   │         │    Email, S3,     │    │
│  │   Guards)    │         │    QR, PDF)       │    │
│  └──────┬───────┘         └────────┬──────────┘    │
│         │   Puerto Entrante        │ Puerto Saliente│
│  ═══════╪══════════════════════════╪═══════════════ │
│         ▼       APLICACIÓN         ▼               │
│  ┌─────────────────────────────────────────────┐   │
│  │              Use Cases                      │   │
│  │  (Orquesta el dominio, no conoce HTTP       │   │
│  │   ni TypeORM ni NestJS)                     │   │
│  └─────────────────────────────────────────────┘   │
│  ═══════════════════════════════════════════════   │
│                    DOMINIO                         │
│  ┌─────────────────────────────────────────────┐   │
│  │  Entidades de Dominio · Value Objects ·     │   │
│  │  Domain Exceptions · Business Rules         │   │
│  │  (Cero dependencias de frameworks)          │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Regla de dependencias:** Las dependencias solo apuntan hacia adentro (hacia el dominio). El dominio no importa nada de la capa de aplicación ni de infraestructura.

### 2.2 SOLID

| Principio | Aplicación en el proyecto |
|-----------|--------------------------|
| **Single Responsibility** | Un use case = una responsabilidad. Un repositorio = un agregado. |
| **Open/Closed** | Extensión mediante nuevos adaptadores, no modificando use cases existentes. |
| **Liskov Substitution** | Los adaptadores de repositorio son intercambiables vía la interfaz `IXxxRepository`. |
| **Interface Segregation** | Los puertos definen contratos mínimos. Nunca una interfaz con métodos que no usa su cliente. |
| **Dependency Inversion** | Los use cases dependen de `IXxxRepository` (interfaz), nunca de `TypeOrmXxxRepository` (implementación). |

### 2.3 Clean Architecture

El proyecto aplica los conceptos de Clean Architecture de Robert C. Martin adaptados a NestJS:

- **Regla de dependencias:** El código fuente solo apunta hacia el interior del círculo.
- **Entidades** = Dominio puro (sin frameworks).
- **Use Cases** = Aplicación (orquesta entidades, usa puertos).
- **Adaptadores** = Infraestructura (controllers, TypeORM, servicios externos).

### 2.4 Separación de Responsabilidades

| Capa | Responsabilidad única |
|------|-----------------------|
| Controller | Recibir HTTP, validar DTO de entrada, llamar use case, retornar DTO de salida |
| Use Case | Orquestar la lógica de negocio. Llamar repositorios, lanzar domain exceptions |
| Repository Interface | Definir el contrato de persistencia en términos del dominio |
| Repository Implementation | Traducir entre entidades TypeORM y entidades de dominio |
| Mapper | Conversión entre capas (Domain ↔ Persistence ↔ DTO) |
| Domain Entity | Representar el estado y comportamiento del negocio |

### 2.5 Dependency Inversion

```typescript
// ✅ CORRECTO: use case depende de la interfaz (puerto)
export class CrearSolicitudUseCase {
  constructor(
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepository: ISolicitudRepository,
  ) {}
}

// ❌ INCORRECTO: use case depende de la implementación TypeORM
export class CrearSolicitudUseCase {
  constructor(
    private readonly solicitudRepository: TypeOrmSolicitudRepository,
  ) {}
}
```

### 2.6 Domain Driven Design (nivel del proyecto)

El proyecto aplica DDD táctico en los siguientes patrones:

| Patrón DDD | Usado en el proyecto | Ubicación |
|------------|----------------------|-----------|
| **Entity** | Objetos con identidad UUID, ciclo de vida | `domain/entities/` |
| **Value Object** | Placa, NIT, Email (inmutables, sin identidad) | `domain/value-objects/` |
| **Domain Exception** | Excepciones semánticas del negocio | `common/exceptions/` |
| **Repository Interface** | Puerto de persistencia del dominio | `domain/ports/` |
| **Use Case** | Caso de uso de aplicación | `application/use-cases/` |
| **Aggregate Root** | No aplica en fase actual (agregados simples) | — |
| **Domain Event** | Diferido. Reservado para BullMQ en Fase 5+ | — |

---

## 3. Estructura Oficial de Módulos

### 3.1 Árbol de un Módulo

```
backend/src/modules/{nombre-modulo}/
├── domain/
│   ├── entities/
│   │   └── {nombre}.entity.ts              # Entidad de dominio pura
│   ├── value-objects/
│   │   └── {nombre}.vo.ts                  # Value objects inmutables
│   ├── ports/
│   │   └── {nombre}.repository.interface.ts # Interface del repositorio
│   └── exceptions/
│       └── {nombre}-not-found.exception.ts  # Si el módulo tiene exc. propias
│
├── application/
│   └── use-cases/
│       ├── crear-{nombre}/
│       │   ├── crear-{nombre}.use-case.ts
│       │   ├── crear-{nombre}.dto.ts        # DTO de entrada
│       │   └── crear-{nombre}-response.dto.ts # DTO de salida
│       └── obtener-{nombre}/
│           ├── obtener-{nombre}.use-case.ts
│           └── obtener-{nombre}-response.dto.ts
│
├── infrastructure/
│   ├── controllers/
│   │   └── {nombre}.controller.ts
│   ├── persistence/
│   │   ├── {nombre}.entity.ts              # Entidad TypeORM (≠ dominio)
│   │   ├── typeorm-{nombre}.repository.ts  # Implementación del puerto
│   │   └── {nombre}.mapper.ts              # Conversión dominio ↔ TypeORM
│   └── adapters/                           # Integraciones externas (S3, email, etc.)
│       └── {servicio}.adapter.ts
│
└── {nombre}.module.ts                      # NestJS module
```

### 3.2 Árbol completo de `src/`

```
backend/src/
├── common/
│   ├── constants/
│   │   └── swagger.constants.ts
│   ├── decorators/
│   │   └── roles.decorator.ts
│   ├── enums/
│   │   ├── estado-solicitud.enum.ts
│   │   ├── estado-permiso.enum.ts
│   │   └── index.ts
│   ├── exceptions/
│   │   ├── domain.exception.ts
│   │   ├── not-found.exception.ts
│   │   ├── conflict.exception.ts
│   │   ├── business-rule.exception.ts
│   │   ├── unauthorized.exception.ts
│   │   └── index.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts               # [Fase 3]
│   │   └── roles.guard.ts                  # [Fase 3]
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── response-transform.interceptor.ts
│   └── interfaces/
│       └── api-response.interface.ts
│
├── config/
│   ├── configuration.ts
│   ├── validation.schema.ts
│   └── typeorm-cli.config.ts
│
├── modules/
│   ├── auth/                  # [Fase 3]
│   ├── ciudadanos/            # [Fase 4]
│   ├── configuracion/         # [Fase 2 — B1]
│   ├── dependencias/          # [Fase 2]
│   ├── documentos/            # [Fase 4]
│   ├── health/                # [Fase 2 — implementado]
│   ├── motivos/               # [Fase 2]
│   ├── motocicletas/          # [Fase 4]
│   ├── notificaciones/        # [Fase 5]
│   ├── permisos/              # [Fase 5]
│   ├── roles/                 # [Fase 3]
│   ├── solicitudes/           # [Fase 4]
│   └── usuarios/              # [Fase 3]
│
├── app.module.ts
└── main.ts
```

---

## 4. Convenciones de Nombres

### 4.1 Archivos y Carpetas

| Artefacto | Convención | Ejemplo |
|-----------|-----------|---------|
| Archivos | `kebab-case` | `crear-solicitud.use-case.ts` |
| Carpetas | `kebab-case` | `use-cases/`, `value-objects/` |
| Módulos NestJS | `{nombre}.module.ts` | `solicitudes.module.ts` |
| Entidad de dominio | `{nombre}.entity.ts` en `domain/entities/` | `solicitud.entity.ts` |
| Entidad TypeORM | `{nombre}.entity.ts` en `infrastructure/persistence/` | `solicitud.entity.ts` |
| Repositorio interfaz | `{nombre}.repository.interface.ts` | `solicitud.repository.interface.ts` |
| Repositorio impl. | `typeorm-{nombre}.repository.ts` | `typeorm-solicitud.repository.ts` |
| Mapper | `{nombre}.mapper.ts` | `solicitud.mapper.ts` |
| Use Case | `{verbo}-{nombre}.use-case.ts` | `crear-solicitud.use-case.ts` |
| DTO entrada | `{verbo}-{nombre}.dto.ts` o `{nombre}.dto.ts` | `crear-solicitud.dto.ts` |
| DTO salida | `{nombre}-response.dto.ts` | `solicitud-response.dto.ts` |
| Controller | `{nombre}.controller.ts` | `solicitudes.controller.ts` |
| Guard | `{nombre}.guard.ts` | `jwt-auth.guard.ts` |
| Decorator | `{nombre}.decorator.ts` | `current-user.decorator.ts` |
| Filter | `{nombre}.filter.ts` | `http-exception.filter.ts` |
| Interceptor | `{nombre}.interceptor.ts` | `logging.interceptor.ts` |
| Adapter | `{nombre}.adapter.ts` | `minio-storage.adapter.ts` |
| Value Object | `{nombre}.vo.ts` | `placa.vo.ts` |
| Domain Exception | `{nombre}.exception.ts` | `solicitud-duplicada.exception.ts` |
| Enum | `{nombre}.enum.ts` | `estado-solicitud.enum.ts` |
| Interface | `{nombre}.interface.ts` | `api-response.interface.ts` |
| Constante | `{nombre}.constants.ts` | `swagger.constants.ts` |
| Port Interface | `i-{nombre}.port.ts` o `{nombre}.repository.interface.ts` | `i-storage.port.ts` |

### 4.2 Clases TypeScript

| Artefacto | Convención | Ejemplo |
|-----------|-----------|---------|
| Entidad dominio | `PascalCase` | `Solicitud`, `Ciudadano` |
| Entidad TypeORM | `PascalCase + Entity` | `SolicitudEntity`, `CiudadanoEntity` |
| Use Case | `PascalCase + UseCase` | `CrearSolicitudUseCase` |
| Repository interface | `I + PascalCase + Repository` | `ISolicitudRepository` |
| Repository impl. | `TypeOrm + PascalCase + Repository` | `TypeOrmSolicitudRepository` |
| Mapper | `PascalCase + Mapper` | `SolicitudMapper` |
| Controller | `PascalCase + Controller` | `SolicitudesController` |
| DTO entrada | `PascalCase + Dto` | `CrearSolicitudDto` |
| DTO salida | `PascalCase + ResponseDto` | `SolicitudResponseDto` |
| Module | `PascalCase + Module` | `SolicitudesModule` |
| Guard | `PascalCase + Guard` | `JwtAuthGuard`, `RolesGuard` |
| Adapter | `PascalCase + Adapter` | `MinioStorageAdapter` |
| Value Object | `PascalCase + VO` (opcional) | `Placa`, `PlacaVO` |
| Domain Exception | `PascalCase + Exception` | `SolicitudDuplicadaException` |
| Enum | `PascalCase + Enum` (en el archivo); valores en `UPPER_SNAKE_CASE` | `EstadoSolicitudEnum` |
| Interfaz | `I + PascalCase` (puertos externos) o `PascalCase` (respuestas) | `IStoragePort`, `ApiResponse` |

### 4.3 Tokens de Inyección

Los tokens de inyección de repositorios y puertos deben ser `Symbol` para evitar colisiones:

```typescript
// En el módulo o en un archivo de constantes del módulo
export const SOLICITUD_REPOSITORY_TOKEN = Symbol('ISolicitudRepository');
export const STORAGE_PORT_TOKEN = Symbol('IStoragePort');
```

### 4.4 Enums

```typescript
// ✅ CORRECTO
export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  EN_REVISION = 'EN_REVISION',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  CORRECCION_SOLICITADA = 'CORRECCION_SOLICITADA',
}

// ❌ INCORRECTO: valores en minúsculas o mezclados
export enum EstadoSolicitud {
  Pendiente = 'pendiente',
}
```

### 4.5 Commits

Ver [§15 Convenciones para Commits](#15-convenciones-para-commits).

---

## 5. Convenciones de Capas

### 5.1 Qué puede importar cada capa

```
┌──────────────────────────────────────────────────────────┐
│  INFRAESTRUCTURA                                         │
│  Puede importar: TODO (dominio, aplicación, NestJS,      │
│                  TypeORM, librerías externas)            │
│  ┌─────────────────────────────────────────────┐        │
│  │  APLICACIÓN (Use Cases)                     │        │
│  │  Puede importar: dominio, interfaces de      │        │
│  │  puertos, common/exceptions, common/enums    │        │
│  │  NO puede importar: NestJS HTTP, TypeORM,   │        │
│  │  Express, class-validator, class-transformer │        │
│  │  ┌────────────────────────────────────┐     │        │
│  │  │  DOMINIO                           │     │        │
│  │  │  Puede importar: NADA de capas     │     │        │
│  │  │  superiores. Solo TypeScript puro. │     │        │
│  │  │  Opcionalmente: common/enums       │     │        │
│  │  └────────────────────────────────────┘     │        │
│  └─────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Dependencias explícitamente prohibidas por capa

#### Capa de Dominio — prohibido importar:
- `@nestjs/*` (cualquier paquete de NestJS)
- `typeorm` o `@nestjs/typeorm`
- `express` o tipos HTTP
- `class-validator` o `class-transformer`
- Módulos de infraestructura de otros módulos

#### Capa de Aplicación (Use Cases) — prohibido importar:
- `@nestjs/common`, `@nestjs/core`, `@nestjs/swagger`
- `typeorm`, `EntityManager`, `Repository` de TypeORM
- `Request`, `Response` de Express
- `class-validator`, `class-transformer` (en use cases)
- Implementaciones concretas de repositorios (`TypeOrmXxxRepository`)

#### Capa de Infraestructura — prohibido importar:
- Implementaciones concretas de otros módulos (solo interfaces)
- No se deben hacer imports de `infrastructure/` de otros módulos

### 5.3 Comunicación entre módulos

Los módulos se comunican **únicamente a través de interfaces o eventos**, nunca importando implementaciones directamente.

```typescript
// ✅ CORRECTO: módulo A expone un servicio de aplicación
// En SolicitudesModule
providers: [CrearSolicitudUseCase],
exports: [CrearSolicitudUseCase],

// En PermisosModule
imports: [SolicitudesModule],
// Inyecta CrearSolicitudUseCase directamente

// ❌ INCORRECTO: módulo A importa repositorio de módulo B
import { TypeOrmSolicitudRepository } from '../solicitudes/infrastructure/...';
```

---

## 6. Response Contract Oficial

Este contrato está implementado en `backend/src/common/` y es el único formato de respuesta HTTP permitido. No crear formatos alternativos.

### 6.1 Respuesta exitosa — recurso único (200 / 201)

```json
{
  "success": true,
  "data": { },
  "message": "Operación exitosa",
  "timestamp": "2026-08-02T19:30:00.000Z"
}
```

**TypeScript:** `ApiResponse<T>` en `common/interfaces/api-response.interface.ts`

El campo `message` es emitido automáticamente por `ResponseTransformInterceptor` con el valor `"Operación exitosa"`. Si un endpoint necesita un mensaje diferente, el controller debe retornar el objeto completo manualmente y decorar el método con `@SkipResponseTransform()` (por implementar si el caso surge).

### 6.2 Respuesta exitosa — listado paginado (200)

```json
{
  "success": true,
  "data": [],
  "message": "Listado obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00.000Z",
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**TypeScript:** `ApiListResponse<T>` en `common/interfaces/api-response.interface.ts`

> Los listados paginados no pasan por `ResponseTransformInterceptor`. El use case o el controller construye `ApiListResponse<T>` manualmente para incluir `pagination`.

### 6.3 Respuesta de error — validación (400)

```json
{
  "success": false,
  "message": "Los datos enviados no son válidos",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-08-02T19:30:00.000Z",
  "errors": [
    { "field": "placa", "message": "La placa debe tener el formato colombiano: ABC123 o ABC12D" },
    { "field": "email", "message": "El correo electrónico no es válido" }
  ]
}
```

Emitido automáticamente por `ValidationPipe.exceptionFactory` + `HttpExceptionFilter`. No requiere código adicional en los controllers.

### 6.4 Respuesta de error — no autorizado (401)

```json
{
  "success": false,
  "message": "No autorizado",
  "code": "UNAUTHORIZED",
  "timestamp": "2026-08-02T19:30:00.000Z"
}
```

### 6.5 Respuesta de error — prohibido (403)

```json
{
  "success": false,
  "message": "No tiene permisos para realizar esta acción",
  "code": "FORBIDDEN",
  "timestamp": "2026-08-02T19:30:00.000Z"
}
```

### 6.6 Respuesta de error — no encontrado (404)

```json
{
  "success": false,
  "message": "Solicitud no encontrada",
  "code": "NOT_FOUND",
  "timestamp": "2026-08-02T19:30:00.000Z"
}
```

### 6.7 Respuesta de error — conflicto (409)

```json
{
  "success": false,
  "message": "El ciudadano ya tiene una solicitud activa para esta motocicleta",
  "code": "CONFLICT",
  "timestamp": "2026-08-02T19:30:00.000Z"
}
```

### 6.8 Respuesta de error — regla de negocio (422)

```json
{
  "success": false,
  "message": "La solicitud no está en el estado requerido para esta acción",
  "code": "BUSINESS_RULE_ERROR",
  "timestamp": "2026-08-02T19:30:00.000Z"
}
```

### 6.9 Respuesta de error — servidor (500)

```json
{
  "success": false,
  "message": "Ha ocurrido un error interno. Por favor intente más tarde.",
  "code": "INTERNAL_ERROR",
  "timestamp": "2026-08-02T19:30:00.000Z"
}
```

> Los errores 500 nunca incluyen stack traces ni detalles técnicos. El detalle va al logger (nestjs-pino).

### 6.10 Tabla de Códigos de Error

| HTTP | Código Interno | Cuándo |
|------|----------------|--------|
| 400 | `VALIDATION_ERROR` | DTO inválido, campos faltantes o con formato incorrecto |
| 401 | `UNAUTHORIZED` | Sin token, token expirado o token revocado |
| 401 | `TOKEN_EXPIRED` | El access token venció; cliente debe hacer refresh |
| 401 | `ACCOUNT_LOCKED` | Cuenta bloqueada por intentos fallidos |
| 403 | `FORBIDDEN` | Token válido pero rol insuficiente |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Conflicto de datos |
| 422 | `BUSINESS_RULE_ERROR` | Violación de regla de negocio |
| 429 | `RATE_LIMIT_EXCEEDED` | Demasiadas solicitudes desde esta IP |
| 500 | `INTERNAL_ERROR` | Error interno del servidor |
| 503 | `SERVICE_UNAVAILABLE` | Servicio temporalmente no disponible |

---

## 7. Sistema Oficial de Excepciones

Todas las excepciones del proyecto están en `backend/src/common/exceptions/`.

### 7.1 Jerarquía

```
Error (built-in)
└── DomainException (abstracta)
    ├── NotFoundException
    ├── ConflictException
    ├── BusinessRuleException
    └── UnauthorizedException
```

### 7.2 `DomainException` (abstracta)

```typescript
// common/exceptions/domain.exception.ts
export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly httpStatus: number,
  ) { ... }
}
```

**No se instancia directamente.** Extender para crear nuevas excepciones.

### 7.3 Excepciones disponibles

| Clase | HTTP | Code | Cuándo usarla |
|-------|------|------|----------------|
| `NotFoundException` | 404 | `NOT_FOUND` | El recurso solicitado no existe en la BD |
| `ConflictException` | 409 | `CONFLICT` | Duplicado, restricción de unicidad violada |
| `BusinessRuleException` | 422 | `BUSINESS_RULE_ERROR` | Regla de negocio documentada en `REGLAS_NEGOCIO.md` |
| `UnauthorizedException` | 401 | `UNAUTHORIZED` | Operación requiere autenticación (raramente desde use cases) |

### 7.4 Cómo usarlas

```typescript
// En un use case — correcto
import { NotFoundException, ConflictException } from 'src/common/exceptions';

export class ObtenerSolicitudUseCase {
  async execute(id: string): Promise<SolicitudResponseDto> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundException(`Solicitud con id ${id} no encontrada`, 'NOT_FOUND');
    }
    return SolicitudMapper.toResponseDto(solicitud);
  }
}
```

### 7.5 Cuándo NO usarlas

| Situación | Qué usar en su lugar |
|-----------|----------------------|
| Error de validación de DTO | `ValidationPipe` lo maneja automáticamente |
| Errores de infraestructura (BD caída) | Dejar que NestJS maneje el error 500 |
| Restricciones de acceso por rol | `RolesGuard` + `ForbiddenException` de NestJS (solo en guards) |
| Desde un controller | Los controllers nunca lanzan excepciones de dominio directamente |

### 7.6 Crear excepciones de dominio específicas de un módulo

Si un módulo necesita excepciones con códigos específicos adicionales a los genéricos:

```typescript
// modules/solicitudes/domain/exceptions/solicitud-estado-invalido.exception.ts
import { BusinessRuleException } from 'src/common/exceptions';

export class SolicitudEstadoInvalidoException extends BusinessRuleException {
  constructor(estadoActual: string, estadoRequerido: string) {
    super(
      `La solicitud está en estado ${estadoActual}. Se requiere estado ${estadoRequerido}.`,
      'SOLICITUD_ESTADO_INVALIDO',
    );
  }
}
```

---

## 8. Reglas para DTO

### 8.1 DTO de Entrada

Los DTOs de entrada viven en `application/use-cases/{caso}/`:

```typescript
import { IsString, IsNotEmpty, IsEmail, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearSolicitudDto {
  @ApiProperty({
    description: 'Número de placa de la motocicleta en formato colombiano',
    example: 'ABC123',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(7)
  placa: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales del solicitante',
    example: 'Necesito el permiso para asistir a cita médica.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
```

**Reglas obligatorias:**
- Todos los campos deben tener `@ApiProperty` o `@ApiPropertyOptional`.
- Todos los campos deben tener al menos un decorador de `class-validator`.
- Usar `@IsOptional()` para campos opcionales (nunca `?` sin decorador).
- Nunca incluir `id`, `createdAt`, `updatedAt` en DTOs de creación.
- Nunca incluir campos de auditoría ni relaciones TypeORM.

### 8.2 DTO de Salida (Response)

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class SolicitudResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '20260802-PYP-000123' })
  numeroRadicado: string;

  @ApiProperty({ example: 'PENDIENTE', enum: EstadoSolicitud })
  estado: EstadoSolicitud;

  @ApiProperty({ example: '2026-08-02T19:30:00.000Z' })
  createdAt: string;
}
```

**Reglas obligatorias:**
- Todos los campos con `@ApiProperty`.
- Nunca incluir la entidad TypeORM directamente.
- Nunca incluir contraseñas, hashes, tokens ni datos sensibles.
- Las fechas se retornan en ISO 8601 (`.toISOString()`).
- Los UUIDs se retornan como `string`.

### 8.3 Transformaciones

```typescript
// Permitido en DTOs de entrada
@Transform(({ value }) => value?.trim().toUpperCase())
@IsString()
placa: string;

// Permitido para convertir tipos
@Type(() => Number)
@IsInt()
@Min(1)
page: number = 1;
```

`class-transformer` y `class-validator` solo se usan en DTOs, nunca en use cases ni en entidades de dominio.

### 8.4 DTO de Paginación

Usar `PaginationQuery` de `common/interfaces/api-response.interface.ts` como base:

```typescript
import { PaginationQuery } from 'src/common/interfaces/api-response.interface';

export class ListarSolicitudesDto implements PaginationQuery {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

---

## 9. Reglas para Controllers

### 9.1 Estructura obligatoria

```typescript
import { Controller, Get, Post, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SWAGGER_BEARER_TOKEN } from 'src/common/constants/swagger.constants';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/decorators/roles.decorator';

@ApiTags('solicitudes')
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
@Controller('solicitudes')
export class SolicitudesController {
  constructor(
    private readonly crearSolicitudUseCase: CrearSolicitudUseCase,
    private readonly obtenerSolicitudUseCase: ObtenerSolicitudUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.FUNCIONARIO, UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Crear una nueva solicitud',
    description: 'Registra una nueva solicitud de permiso de circulación.',
  })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente', type: SolicitudResponseDto })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 409, description: 'Ya existe una solicitud activa para esta moto' })
  async crear(@Body() dto: CrearSolicitudDto): Promise<SolicitudResponseDto> {
    return this.crearSolicitudUseCase.execute(dto);
  }

  @Get(':id')
  @Roles(UserRole.FUNCIONARIO, UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  @ApiResponse({ status: 200, description: 'Solicitud encontrada', type: SolicitudResponseDto })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async obtener(@Param('id', ParseUUIDPipe) id: string): Promise<SolicitudResponseDto> {
    return this.obtenerSolicitudUseCase.execute(id);
  }
}
```

### 9.2 Decoradores obligatorios por endpoint

| Decorador | Obligatorio | Cuándo |
|-----------|-------------|--------|
| `@ApiTags(...)` | Sí | En la clase (una vez por controller) |
| `@ApiBearerAuth(SWAGGER_BEARER_TOKEN)` | Sí | En la clase si requiere auth (no en public) |
| `@ApiOperation({ summary, description })` | Sí | En cada método |
| `@ApiResponse({ status, description, type })` | Sí | Al menos para 200/201, 400, 401, 404 según aplique |
| `@Roles(...)` | Sí | En cada método que requiera rol |
| `@HttpCode(HttpStatus.CREATED)` | Sí | En métodos POST que crean recursos |
| `@ParseUUIDPipe` | Sí | En parámetros `:id` que sean UUID |

### 9.3 Lo que un controller nunca debe hacer

- Contener lógica de negocio.
- Acceder directamente a repositorios o TypeORM.
- Lanzar `DomainException` directamente.
- Retornar entidades TypeORM (`XxxEntity`).
- Construir `ApiListResponse` sin delegar al use case.
- Manejar transacciones de base de datos.
- Importar de `infrastructure/persistence/` de ningún módulo.

### 9.4 Endpoints públicos (sin autenticación)

```typescript
// No llevan @ApiBearerAuth ni @Roles
@Controller('public/solicitudes')
export class SolicitudesPublicController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear solicitud (portal ciudadano)' })
  async crear(@Body() dto: CrearSolicitudPublicaDto): Promise<SolicitudResponseDto> {
    return this.crearSolicitudPublicaUseCase.execute(dto);
  }
}
```

---

## 10. Reglas para Use Cases

### 10.1 Estructura obligatoria

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { ISolicitudRepository, SOLICITUD_REPOSITORY_TOKEN } from '../ports/solicitud.repository.interface';
import { NotFoundException } from 'src/common/exceptions';
import { SolicitudResponseDto } from './obtener-solicitud-response.dto';
import { SolicitudMapper } from '../../infrastructure/persistence/solicitud.mapper';

@Injectable()
export class ObtenerSolicitudUseCase {
  constructor(
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepository: ISolicitudRepository,
  ) {}

  async execute(id: string): Promise<SolicitudResponseDto> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundException(`Solicitud no encontrada`, 'NOT_FOUND');
    }
    return SolicitudMapper.toResponseDto(solicitud);
  }
}
```

### 10.2 Reglas

- Un use case = **un método `execute()`**.
- Inyección exclusivamente mediante **tokens `Symbol`** e **interfaces de puerto**.
- Solo lanza excepciones de `common/exceptions/` (subclases de `DomainException`).
- Devuelve siempre un **DTO de salida**, nunca una entidad TypeORM ni una entidad de dominio.
- No conoce nada de HTTP: ni status codes, ni headers, ni la request.
- No maneja transacciones directamente (el repositorio abstrae la transacción).
- No accede a `EntityManager` de TypeORM.
- Un use case **puede llamar a otro use case** si la operación es una orquestación de alto nivel (ej: `AprobarSolicitudUseCase` puede llamar a `CrearPermisoUseCase`).

### 10.3 Declaración en el módulo

```typescript
@Module({
  providers: [
    CrearSolicitudUseCase,
    ObtenerSolicitudUseCase,
    {
      provide: SOLICITUD_REPOSITORY_TOKEN,
      useClass: TypeOrmSolicitudRepository,
    },
  ],
  exports: [CrearSolicitudUseCase, ObtenerSolicitudUseCase],
})
export class SolicitudesModule {}
```

---

## 11. Reglas para Repositories

### 11.1 Interfaz (Puerto de dominio)

```typescript
// domain/ports/solicitud.repository.interface.ts
import { Solicitud } from '../entities/solicitud.entity';

export const SOLICITUD_REPOSITORY_TOKEN = Symbol('ISolicitudRepository');

export interface ISolicitudRepository {
  findById(id: string): Promise<Solicitud | null>;
  findAll(options: { page: number; limit: number }): Promise<{ data: Solicitud[]; total: number }>;
  save(solicitud: Solicitud): Promise<Solicitud>;
  update(id: string, data: Partial<Solicitud>): Promise<Solicitud>;
  delete(id: string): Promise<void>;
}
```

**Reglas:**
- Los métodos reciben y devuelven **entidades de dominio** (nunca entidades TypeORM).
- Los tipos de retorno reflejan el dominio: `Solicitud | null`, `{ data: Solicitud[]; total: number }`.
- No incluye métodos de TypeORM (`createQueryBuilder`, `findOne`, etc.).

### 11.2 Implementación (Adaptador de infraestructura)

```typescript
// infrastructure/persistence/typeorm-solicitud.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISolicitudRepository } from '../../domain/ports/solicitud.repository.interface';
import { Solicitud } from '../../domain/entities/solicitud.entity';
import { SolicitudEntity } from './solicitud.entity';
import { SolicitudMapper } from './solicitud.mapper';

@Injectable()
export class TypeOrmSolicitudRepository implements ISolicitudRepository {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly repo: Repository<SolicitudEntity>,
  ) {}

  async findById(id: string): Promise<Solicitud | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? SolicitudMapper.toDomain(entity) : null;
  }

  async save(solicitud: Solicitud): Promise<Solicitud> {
    const entity = SolicitudMapper.toPersistence(solicitud);
    const saved = await this.repo.save(entity);
    return SolicitudMapper.toDomain(saved);
  }
}
```

### 11.3 Mapper

```typescript
// infrastructure/persistence/solicitud.mapper.ts
import { Solicitud } from '../../domain/entities/solicitud.entity';
import { SolicitudEntity } from './solicitud.entity';
import { SolicitudResponseDto } from '../../application/use-cases/obtener-solicitud/solicitud-response.dto';

export class SolicitudMapper {
  static toDomain(entity: SolicitudEntity): Solicitud {
    // Entidad TypeORM → Entidad de dominio
    return new Solicitud({
      id: entity.id,
      estado: entity.estado,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(domain: Solicitud): SolicitudEntity {
    // Entidad de dominio → Entidad TypeORM
    const entity = new SolicitudEntity();
    entity.id = domain.id;
    entity.estado = domain.estado;
    return entity;
  }

  static toResponseDto(domain: Solicitud): SolicitudResponseDto {
    // Entidad de dominio → DTO de respuesta
    return {
      id: domain.id,
      estado: domain.estado,
      createdAt: domain.createdAt.toISOString(),
    };
  }
}
```

**Reglas:**
- El mapper es una **clase estática** (no inyectable, sin estado).
- Tres métodos: `toDomain()`, `toPersistence()`, `toResponseDto()`.
- No contiene lógica de negocio; solo conversión de estructuras.

---

## 12. Reglas para Seguridad

### 12.1 JWT

| Parámetro | Valor |
|-----------|-------|
| Access Token TTL | 15 minutos |
| Refresh Token TTL | 7 días |
| Algoritmo | HS256 (secreto configurable vía `.env`) |
| Almacenamiento recomendado (frontend) | Access Token en memoria; Refresh Token en HttpOnly Cookie |
| Rotación | El refresh token se renueva en cada uso; el anterior se revoca |

El `JwtAuthGuard` y el `RolesGuard` viven en `common/guards/` y son registrados globalmente en `AppModule`. Los controllers pueden excluir la autenticación con `@Public()` (por implementar en Fase 3).

### 12.2 Roles

```typescript
// Roles disponibles (ADR-004)
export enum UserRole {
  FUNCIONARIO = 'FUNCIONARIO',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

// En un controller
@Roles(UserRole.ADMINISTRADOR)
@Delete(':id')
async eliminar(@Param('id', ParseUUIDPipe) id: string): Promise<void> { ... }
```

El `ADMINISTRADOR` hereda todos los permisos del `FUNCIONARIO`. El guard verifica que el rol del token coincida con los roles permitidos del endpoint.

### 12.3 Guard de autenticación (flujo)

```
Request
  → JwtAuthGuard: verifica Bearer token, decodifica payload, adjunta usuario a request
  → RolesGuard: lee @Roles() del endpoint, verifica que usuario.rol esté permitido
  → Controller: recibe request con usuario autenticado en req.user
```

### 12.4 Decorador `@CurrentUser()`

```typescript
// common/decorators/current-user.decorator.ts (Fase 3)
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload = request.user;
    return data ? user[data] : user;
  },
);

// Uso en controller
@Get('perfil')
async obtenerPerfil(@CurrentUser() user: JwtPayload): Promise<UsuarioResponseDto> { ... }
```

### 12.5 Seguridad HTTP

| Mecanismo | Configuración |
|-----------|--------------|
| `helmet` | Activo. `contentSecurityPolicy`, `hsts` solo en producción |
| CORS | `origin` desde `app.frontendUrl` del entorno. `credentials: true` |
| `ValidationPipe` | `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` |
| Rate Limiting | `@nestjs/throttler` (ver `API_FUNCIONAL.md §5`) |
| Contraseñas | `bcrypt` con `saltRounds = 12` |

### 12.6 Eventos de Auditoría registrados

Toda acción relevante debe registrar un evento en la tabla `auditoria`. Los valores del campo `accion` están normalizados:

| Acción (`accion`) | Entidad afectada | Quien puede registrarla |
|---|---|---|
| `crear_solicitud` | `solicitudes` | Sistema (ciudadano público) |
| `aprobar_solicitud` | `solicitudes` | Funcionario / Administrador |
| `rechazar_solicitud` | `solicitudes` | Funcionario / Administrador |
| `solicitar_correccion` | `solicitudes` | Funcionario / Administrador |
| `corregir_solicitud` | `solicitudes` | Sistema (ciudadano) |
| `adjuntar_documento` | `documentos` | Sistema (ciudadano) |
| `generar_permiso_pdf` | `permisos` | Sistema (job BullMQ) |
| `revocar_permiso` | `permisos` | Administrador |
| `editar_condiciones_permiso` | `permisos` | Funcionario / Administrador |
| `validar_qr` | `qr_validaciones` | Sistema (público) |
| `login` | `usuarios` | Sistema |
| `logout` | `usuarios` | Sistema |
| `cambiar_contrasena` | `usuarios` | Usuario autenticado |
| `crear_usuario` | `usuarios` | Administrador |
| `desactivar_usuario` | `usuarios` | Administrador |

Para `editar_condiciones_permiso`, el campo `detalle` del registro de auditoría debe incluir `{ "valorAnterior": "...", "valorNuevo": "..." }` en formato JSON (RN-38).

### 12.7 Variables de entorno

Nunca hardcodear secretos en el código. Todo secreto va en `.env` (gitignored) y se accede mediante `ConfigService`:

```typescript
// ✅ CORRECTO
const secret = this.configService.get<string>('jwt.secret');

// ❌ INCORRECTO
const secret = 'mi-secreto-hardcodeado';
```

---

## 13. Convenciones para Swagger

### 13.1 Cada endpoint debe documentar

```typescript
@ApiOperation({
  summary: 'Título corto (verbo + recurso)',          // Obligatorio
  description: 'Explicación detallada si es necesario', // Opcional
})
@ApiResponse({ status: 200, description: '...', type: XxxResponseDto })   // 200 o 201
@ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })  // Si acepta body
@ApiResponse({ status: 401, description: 'No autenticado' })              // Si requiere auth
@ApiResponse({ status: 403, description: 'Rol insuficiente' })            // Si tiene @Roles
@ApiResponse({ status: 404, description: 'Recurso no encontrado' })       // Si puede no existir
@ApiResponse({ status: 409, description: '...' })                         // Si puede haber conflicto
@ApiResponse({ status: 422, description: '...' })                         // Si puede violar regla
```

### 13.2 Cada DTO debe documentar todos sus campos

```typescript
@ApiProperty({
  description: 'Descripción clara del campo',
  example: 'ABC123',
  enum: EstadoSolicitud,        // Para enums
  required: false,              // Si es opcional (usar @ApiPropertyOptional en su lugar)
  minimum: 1,                   // Para números
  maximum: 100,
  maxLength: 255,               // Para strings
})
```

### 13.3 Tags disponibles (definidos en `main.ts`)

| Tag | Módulo |
|-----|--------|
| `health` | Estado del sistema |
| `auth` | Autenticación y sesión |
| `usuarios` | Gestión de usuarios |
| `solicitudes` | Flujo de trámite |
| `permisos` | Permisos generados |
| `documentos` | Documentos adjuntos |
| `motivos` | Catálogo de motivos |
| `dependencias` | Dependencias de la Alcaldía |
| `configuracion` | Parámetros del sistema |
| `auditoria` | Bitácora de acciones |
| `reportes` | Reportes y exportaciones |

Todos los controllers deben usar exactamente uno de estos tags con `@ApiTags(...)`. No crear tags nuevos sin actualizar `main.ts`.

### 13.4 Bearer auth en Swagger

```typescript
// Siempre usar la constante, nunca el string literal
import { SWAGGER_BEARER_TOKEN } from 'src/common/constants/swagger.constants';

@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
@Controller('solicitudes')
```

### 13.5 Swagger en producción

Swagger solo está activo cuando `NODE_ENV !== 'production'`. Nunca exponer `/api/docs` en producción sin protección básica adicional.

---

## 14. Convenciones para Pruebas

### 14.1 Tipos de pruebas y cobertura mínima

| Tipo | Herramienta | Cobertura mínima | Qué prueba |
|------|-------------|-----------------|------------|
| Unitaria | Jest | 80% en use cases | Use cases con repositorios mockeados |
| Integración | Jest + Supertest | Endpoints críticos | Controllers + integración real o in-memory DB |
| E2E | Jest + Supertest | Flujos críticos | Flujo completo: login → crear solicitud → aprobar → generar permiso |

### 14.2 Nomenclatura de archivos de prueba

```
{nombre}.spec.ts           # Prueba unitaria
{nombre}.integration.spec.ts  # Prueba de integración
{nombre}.e2e-spec.ts       # Prueba E2E (en /test)
```

### 14.3 Estructura de prueba unitaria de Use Case

```typescript
// crear-solicitud.use-case.spec.ts
describe('CrearSolicitudUseCase', () => {
  let useCase: CrearSolicitudUseCase;
  let solicitudRepository: jest.Mocked<ISolicitudRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CrearSolicitudUseCase,
        {
          provide: SOLICITUD_REPOSITORY_TOKEN,
          useValue: {
            findByPlaca: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(CrearSolicitudUseCase);
    solicitudRepository = module.get(SOLICITUD_REPOSITORY_TOKEN);
  });

  it('debe crear la solicitud cuando no existe una activa', async () => {
    solicitudRepository.findByPlaca.mockResolvedValue(null);
    solicitudRepository.save.mockResolvedValue(mockSolicitud);

    const result = await useCase.execute(mockDto);

    expect(result.estado).toBe(EstadoSolicitud.PENDIENTE);
    expect(solicitudRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar ConflictException si ya existe solicitud activa', async () => {
    solicitudRepository.findByPlaca.mockResolvedValue(mockSolicitudActiva);

    await expect(useCase.execute(mockDto)).rejects.toThrow(ConflictException);
  });
});
```

### 14.4 Lo que no se prueba directamente

- Entidades TypeORM (probadas indirectamente por pruebas de integración).
- Mappers con data trivial (solo mapear campos).
- Configuración de NestJS.

---

## 15. Convenciones para Commits

### 15.1 Formato

```
<tipo>(<scope>): <descripción imperativa en español>

[cuerpo opcional — qué y por qué, no cómo]

[Co-Authored-By: ...]
```

### 15.2 Tipos permitidos

| Tipo | Cuándo |
|------|--------|
| `feat` | Nueva funcionalidad o endpoint |
| `fix` | Corrección de un bug |
| `refactor` | Cambio de código sin cambio funcional |
| `test` | Agregar o modificar pruebas |
| `docs` | Documentación únicamente |
| `chore` | Cambios de configuración, dependencias, scripts |
| `perf` | Mejora de rendimiento |
| `style` | Formato, linting (sin cambio lógico) |
| `ci` | Cambios en CI/CD |

### 15.3 Scopes válidos

```
auth        usuarios       roles         solicitudes
permisos    ciudadanos     motocicletas  configuracion
motivos     dependencias   documentos    notificaciones
auditoria   reportes       health        common
database    docker         ci            build
```

### 15.4 Ejemplos correctos

```
feat(solicitudes): implementar endpoint POST /solicitudes

fix(auth): corregir validacion de token expirado en JwtAuthGuard

refactor(common): mover MotocicletaEntity al modulo motocicletas

test(solicitudes): agregar pruebas unitarias para CrearSolicitudUseCase

docs(api): documentar endpoint GET /solicitudes en Swagger
```

### 15.5 Reglas

- Descripción en **imperativo** y **español** (`implementar`, no `implementado` ni `implementando`).
- Máximo 72 caracteres en la primera línea.
- Un commit = un tema. No mezclar refactor con feature en el mismo commit.
- No usar `--no-verify` salvo autorización explícita del Tech Lead.

---

## 16. Quality Gates

Antes de cada Pull Request, **todos** los siguientes puntos deben estar en verde:

### 16.1 Build

```bash
# Debe completar sin errores
npm run build --prefix backend
```

### 16.2 TypeScript

```bash
# Debe completar sin errores (0 errores, warnings aceptables)
cd backend && npx tsc --noEmit
```

### 16.3 Lint

```bash
# Debe completar sin errores (warnings en @typescript-eslint/no-explicit-any aceptables)
npm run lint --prefix backend
```

### 16.4 Tests

```bash
# Cobertura mínima: 80% en use cases
npm run test --prefix backend
npm run test:cov --prefix backend
```

### 16.5 Swagger

- Abrir `http://localhost:3001/api/docs` y verificar que todos los endpoints del módulo nuevo aparecen con sus respuestas documentadas.
- No debe haber endpoints sin `@ApiOperation`.
- No debe haber DTOs con campos sin `@ApiProperty`.

### 16.6 Migraciones

Si se modificó alguna entidad TypeORM:

```bash
cd backend && npm run migration:generate -- src/database/migrations/NombreMigracion
# Revisar el archivo generado antes de hacer commit
npm run migration:run
```

### 16.7 Documentación

- Si el endpoint modifica el contrato de la API, actualizar `docs/API_FUNCIONAL.md` (requiere autorización bajo la política de documentación congelada).
- Si se toma una nueva decisión arquitectónica, agregar ADR en `docs/DECISIONS.md`.

---

## 17. Anti-Patrones Prohibidos

Los siguientes patrones están **explícitamente prohibidos**. Su presencia en una Pull Request es causa de rechazo.

### 17.1 Lógica de negocio en controllers

```typescript
// ❌ PROHIBIDO
@Post()
async crear(@Body() dto: CrearSolicitudDto) {
  const existente = await this.repo.findByPlaca(dto.placa); // Repositorio directo
  if (existente) throw new ConflictException(...);           // Lógica de negocio
  // ...
}

// ✅ CORRECTO: delegar al use case
@Post()
async crear(@Body() dto: CrearSolicitudDto) {
  return this.crearSolicitudUseCase.execute(dto);
}
```

### 17.2 Retornar entidades TypeORM desde controllers o use cases

```typescript
// ❌ PROHIBIDO
async obtener(id: string): Promise<SolicitudEntity> { ... }

// ✅ CORRECTO
async obtener(id: string): Promise<SolicitudResponseDto> { ... }
```

### 17.3 Use cases lanzando HttpException

```typescript
// ❌ PROHIBIDO: use case con dependencia de NestJS HTTP
import { NotFoundException } from '@nestjs/common';
throw new NotFoundException('Solicitud no encontrada');

// ✅ CORRECTO: use case con excepción de dominio
import { NotFoundException } from 'src/common/exceptions';
throw new NotFoundException('Solicitud no encontrada');
```

### 17.4 Repositories usando DTOs

```typescript
// ❌ PROHIBIDO: repositorio recibe DTO
interface ISolicitudRepository {
  save(dto: CrearSolicitudDto): Promise<SolicitudEntity>;
}

// ✅ CORRECTO: repositorio trabaja con entidades de dominio
interface ISolicitudRepository {
  save(solicitud: Solicitud): Promise<Solicitud>;
}
```

### 17.5 Imports entre capas incorrectos

```typescript
// ❌ PROHIBIDO: use case importa de infraestructura
import { TypeOrmSolicitudRepository } from '../../infrastructure/persistence/typeorm-solicitud.repository';

// ❌ PROHIBIDO: use case importa de otro módulo's infrastructure
import { CiudadanoEntity } from '../../../ciudadanos/infrastructure/persistence/ciudadano.entity';

// ✅ CORRECTO: use case usa el token y la interfaz
import { ISolicitudRepository, SOLICITUD_REPOSITORY_TOKEN } from '../ports/solicitud.repository.interface';
```

### 17.6 Acoplamiento entre módulos vía implementaciones

```typescript
// ❌ PROHIBIDO: módulo A importa directamente de infrastructure de módulo B
import { TypeOrmUsuarioRepository } from '../usuarios/infrastructure/persistence/typeorm-usuario.repository';

// ✅ CORRECTO: módulo A importa el use case exportado por módulo B
import { ObtenerUsuarioUseCase } from '../usuarios/application/use-cases/obtener-usuario/obtener-usuario.use-case';
```

### 17.7 Saltarse los puertos (acceso directo a TypeORM desde use cases)

```typescript
// ❌ PROHIBIDO
export class CrearSolicitudUseCase {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly repo: Repository<SolicitudEntity>, // TypeORM directo
  ) {}
}
```

### 17.8 Hardcodear secretos o URLs

```typescript
// ❌ PROHIBIDO
const jwtSecret = 'super-secreto-123';
const dbUrl = 'postgresql://user:pass@localhost:5432/db';

// ✅ CORRECTO
const jwtSecret = this.configService.get<string>('jwt.secret');
```

### 17.9 Lógica de transformación en entidades TypeORM

```typescript
// ❌ PROHIBIDO: método de negocio en entidad TypeORM
@Entity('solicitudes')
export class SolicitudEntity {
  puedeAprobar(): boolean { ... } // Lógica en TypeORM Entity
}

// ✅ CORRECTO: método en entidad de dominio pura
export class Solicitud {
  puedeAprobar(): boolean { ... }
}
```

### 17.10 Commits con múltiples responsabilidades

```
# ❌ PROHIBIDO
feat(varios): implementar módulo solicitudes + refactorizar auth + fix en db

# ✅ CORRECTO: un commit por responsabilidad
feat(solicitudes): implementar CrearSolicitudUseCase
```

---

## 18. Checklist de Desarrollo

Copiar y completar antes de cada Pull Request:

```markdown
## Pre-PR Checklist — {Módulo/Feature}

### Arquitectura
- [ ] El use case no importa nada de infraestructura (NestJS, TypeORM, Express)
- [ ] El controller solo llama use cases, sin lógica de negocio
- [ ] El repositorio implementa la interfaz de dominio exactamente
- [ ] El mapper tiene toDomain(), toPersistence() y toResponseDto()
- [ ] Los tokens de inyección son Symbol(), no strings
- [ ] Las excepciones lanzadas son subclases de DomainException

### Response Contract
- [ ] Las respuestas exitosas siguen ApiResponse<T> o ApiListResponse<T>
- [ ] Los listados incluyen ApiListResponse<T> con pagination completa
- [ ] No se retorna ninguna entidad TypeORM directamente

### DTO
- [ ] Todos los campos de DTOs de entrada tienen decoradores class-validator
- [ ] Todos los campos de DTOs tienen @ApiProperty o @ApiPropertyOptional
- [ ] Los DTOs de salida no incluyen contraseñas ni datos sensibles

### Swagger
- [ ] El controller tiene @ApiTags con un tag de la lista oficial
- [ ] El controller tiene @ApiBearerAuth si requiere autenticación
- [ ] Cada endpoint tiene @ApiOperation con summary
- [ ] Cada endpoint tiene @ApiResponse para al menos 200/201, 400, 401, 404 según aplique
- [ ] Verificado visualmente en http://localhost:3001/api/docs

### Seguridad
- [ ] Los endpoints privados tienen @Roles con los roles correctos
- [ ] No hay secretos hardcodeados en el código
- [ ] Los parámetros UUID usan ParseUUIDPipe

### Calidad
- [ ] tsc --noEmit: 0 errores
- [ ] npm run lint: 0 errores
- [ ] npm run build: exitoso
- [ ] Tests unitarios del use case: escritos y pasando
- [ ] Cobertura del módulo: ≥ 80% en use cases

### Base de datos
- [ ] Si se modificó una entidad TypeORM: migración generada y revisada
- [ ] Si se agregaron índices: documentados en MODELO_DATOS.md
- [ ] Seeds actualizados si aplica

### Git
- [ ] Commits siguen Conventional Commits con scope correcto
- [ ] No hay commits con múltiples responsabilidades mezcladas
- [ ] Rama actualizada con develop antes del PR
```

---

*Este documento está congelado. No modificar sin una nueva decisión arquitectónica documentada en `docs/DECISIONS.md` y autorización explícita del Arquitecto de Software.*

*Última actualización: 2026-08-02 — Fase 2, Pre-B1.*
