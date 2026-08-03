# Especificación Funcional de la API REST
# Sistema de Permisos de Circulación — Pico y Placa

**Versión:** 1.0  
**Fecha:** 2026-08-02  
**Base URL:** `https://api.dominio.gov.co/api/v1`  
**Documentación interactiva:** `https://api.dominio.gov.co/api/docs` (Swagger UI)  
**OpenAPI spec:** `https://api.dominio.gov.co/api/docs-json`  
**Referencia:** `docs/MODELO_DATOS.md` · `docs/ANALISIS_TECNICO.md`

---

## Índice

1. [Principios Generales](#1-principios-generales)
2. [Autenticación y Autorización](#2-autenticación-y-autorización)
3. [Contratos de Respuesta](#3-contratos-de-respuesta)
4. [Códigos de Error](#4-códigos-de-error)
5. [Rate Limiting](#5-rate-limiting)
6. [Módulo AUTH — Autenticación](#6-módulo-auth--autenticación)
7. [Módulo USUARIOS — Gestión de Usuarios](#7-módulo-usuarios--gestión-de-usuarios)
8. [Módulo ROLES — Roles del Sistema](#8-módulo-roles--roles-del-sistema)
9. [Módulo DEPENDENCIAS — Dependencias de la Alcaldía](#9-módulo-dependencias--dependencias-de-la-alcaldía)
10. [Módulo MOTIVOS — Motivos de Solicitud](#10-módulo-motivos--motivos-de-solicitud)
11. [Módulo CIUDADANOS — Consulta de Ciudadanos](#11-módulo-ciudadanos--consulta-de-ciudadanos)
12. [Módulo MOTOCICLETAS — Consulta de Motocicletas](#12-módulo-motocicletas--consulta-de-motocicletas)
13. [Módulo SOLICITUDES — Flujo de Trámite](#13-módulo-solicitudes--flujo-de-trámite)
14. [Módulo PERMISOS — Permisos Generados](#14-módulo-permisos--permisos-generados)
15. [Módulo DASHBOARD — Indicadores](#15-módulo-dashboard--indicadores)
16. [Módulo REPORTES — Reportes y Exportaciones](#16-módulo-reportes--reportes-y-exportaciones)
17. [Módulo AUDITORÍA — Bitácora](#17-módulo-auditoría--bitácora)
18. [Módulo CONFIGURACIÓN — Parámetros del Sistema](#18-módulo-configuración--parámetros-del-sistema)
19. [Módulo HEALTH — Estado del Sistema](#19-módulo-health--estado-del-sistema)
20. [Matriz de Endpoints](#20-matriz-de-endpoints)
21. [Guía de Implementación Swagger](#21-guía-de-implementación-swagger)

---

## 1. Principios Generales

### Estructura de URL

```
https://api.dominio.gov.co/api/v1/{recurso}
```

| Prefijo | Descripción |
|---------|-------------|
| `/api/v1/` | Endpoints protegidos (requieren JWT) |
| `/api/v1/public/` | Endpoints públicos (sin autenticación, con rate limiting estricto) |

### Convenciones REST

| Método | Semántica |
|--------|-----------|
| `GET` | Obtener recurso(s). Nunca modifica estado |
| `POST` | Crear recurso o ejecutar acción |
| `PUT` | Reemplazar recurso completo |
| `PATCH` | Modificar campo(s) específico(s) de un recurso |
| `DELETE` | Eliminar recurso (soft delete) |

### Formato

- Todas las respuestas: `Content-Type: application/json; charset=utf-8`
- Fechas: ISO 8601 en UTC (`2026-08-02T14:30:00Z`). El frontend convierte a COT (UTC-5)
- UUIDs: formato estándar `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Booleanos: `true` / `false` (nunca `0` / `1`)
- Paginación obligatoria en todos los listados

### Parámetros de Paginación (Listados)

```
?page=1&limit=20&sortBy=created_at&sortOrder=DESC
```

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Número de página |
| `limit` | integer | 20 | Registros por página (máx. 100) |
| `sortBy` | string | `created_at` | Campo de ordenamiento |
| `sortOrder` | string | `DESC` | Dirección: `ASC` o `DESC` |

---

## 2. Autenticación y Autorización

### Esquema de Autenticación JWT

```
Authorization: Bearer {access_token}
```

| Token | TTL | Almacenamiento sugerido |
|-------|-----|------------------------|
| Access Token | 15 minutos | Memoria de la aplicación (no localStorage) |
| Refresh Token | 7 días | HttpOnly Cookie o almacenamiento seguro |

### Flujo de Tokens

```
1. POST /auth/login          → { access_token, refresh_token }
2. Usar access_token en cada request (Authorization: Bearer)
3. Al recibir 401 → POST /auth/refresh con refresh_token
4. El refresh_token anterior se revoca; se emite uno nuevo
5. POST /auth/logout         → revoca el refresh_token activo
```

### Roles del Sistema

| Rol | Código | Descripción |
|-----|--------|-------------|
| Público | — | Sin autenticación. Acceso limitado a rutas `/public/` |
| Funcionario | `funcionario` | Gestiona solicitudes y permisos |
| Administrador | `administrador` | Control total del sistema |

> El administrador hereda todos los permisos del funcionario.

### Leyenda de Acceso en Endpoints

| Símbolo | Significado |
|---------|-------------|
| 🌐 | Público — sin autenticación |
| 🔑 | JWT requerido (cualquier rol autenticado) |
| 👮 | JWT + rol `funcionario` o `administrador` |
| 🛡️ | JWT + rol `administrador` exclusivamente |

---

## 3. Contratos de Respuesta

### Respuesta Exitosa (con datos)

```json
{
  "success": true,
  "data": { },
  "message": "Operación exitosa",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

### Respuesta Exitosa (con paginación)

```json
{
  "success": true,
  "data": [ ],
  "message": "Listado obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Respuesta de Error

```json
{
  "success": false,
  "message": "Descripción legible del error",
  "code": "CODIGO_INTERNO",
  "timestamp": "2026-08-02T19:30:00Z",
  "errors": [
    {
      "field": "email",
      "message": "El campo email debe ser una dirección válida"
    }
  ]
}
```

> `errors[]` solo aparece en errores de validación (400). Nunca en 500.

---

## 4. Códigos de Error

### Tabla de Códigos HTTP

| HTTP | Código Interno | Cuándo ocurre |
|------|----------------|---------------|
| 400 | `VALIDATION_ERROR` | DTO inválido, campos faltantes o con formato incorrecto |
| 401 | `UNAUTHORIZED` | Sin token, token expirado o token revocado |
| 401 | `TOKEN_EXPIRED` | El access token venció; el cliente debe hacer refresh |
| 401 | `ACCOUNT_LOCKED` | Cuenta bloqueada por intentos fallidos |
| 403 | `FORBIDDEN` | Token válido pero rol insuficiente para esta acción |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Conflicto de datos (ej: solicitud ya activa para esta moto) |
| 409 | `EMAIL_IN_USE` | El email ya está registrado |
| 409 | `PLACA_IN_USE` | La placa ya existe para otro ciudadano activo |
| 422 | `BUSINESS_RULE_ERROR` | Violación de regla de negocio |
| 422 | `SOLICITUD_ESTADO_INVALIDO` | La solicitud no está en el estado requerido para esta acción |
| 422 | `PERMISO_YA_VENCIDO` | El permiso ya está vencido; no se puede revocar |
| 422 | `CONTRASENA_REUTILIZADA` | La contraseña ya fue usada anteriormente |
| 422 | `CONTRASENA_EXPIRADA` | La contraseña venció; debe cambiarse antes de continuar |
| 429 | `RATE_LIMIT_EXCEEDED` | Demasiadas solicitudes desde esta IP |
| 500 | `INTERNAL_ERROR` | Error interno del servidor (sin detalles técnicos) |
| 503 | `SERVICE_UNAVAILABLE` | Servicio temporalmente no disponible |

### Ejemplo de Error de Validación (400)

```json
{
  "success": false,
  "message": "Los datos enviados no son válidos",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-08-02T19:30:00Z",
  "errors": [
    { "field": "placa", "message": "La placa debe tener el formato colombiano: ABC123 o ABC12D" },
    { "field": "email", "message": "El correo electrónico no es válido" },
    { "field": "fechaFin", "message": "La fecha de fin debe ser posterior a la fecha de inicio" }
  ]
}
```

### Ejemplo de Error de Negocio (422)

```json
{
  "success": false,
  "message": "El ciudadano ya tiene una solicitud activa para esta motocicleta",
  "code": "CONFLICT",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

## 5. Rate Limiting

| Endpoint | Límite | Ventana | Acción al superar |
|----------|--------|---------|------------------|
| `POST /auth/login` | 5 intentos | 15 min por IP | 429 + bloqueo de cuenta tras 5 intentos |
| `POST /auth/recuperar-contrasena` | 3 intentos | 1 hora por IP | 429 |
| `POST /public/solicitudes` | 5 solicitudes | 1 hora por IP | 429 |
| `GET /public/solicitudes/estado` | 10 consultas | 1 min por IP | 429 |
| `GET /public/verificar/{qr}` | 30 consultas | 1 min por IP | 429 |
| `GET /public/motivos` | 60 consultas | 1 min por IP | 429 |
| Todos los demás endpoints | 100 requests | 1 min por IP | 429 |

**Headers de Rate Limit en respuestas:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 73
X-RateLimit-Reset: 1754154600
```

---

## 6. Módulo AUTH — Autenticación

### `POST /api/v1/auth/login` 🌐

Autentica a un funcionario o administrador y emite los tokens de sesión.

**Rate limiting:** 5 intentos por IP en 15 minutos.

**Request Body:**
```json
{
  "email": "jperez@alcaldia.gov.co",
  "contrasena": "MiContrasena123!"
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `email` | string | ✅ | Email válido, máx. 150 chars |
| `contrasena` | string | ✅ | 10–100 chars |

**Response 200 — Login exitoso:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "d1f3a2b4c5e6...",
    "expiresIn": 900,
    "usuario": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "jperez@alcaldia.gov.co",
      "rol": "funcionario",
      "dependencia": "Secretaría de Movilidad",
      "contrasenaExpirada": false
    }
  },
  "message": "Sesión iniciada correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 401 — Credenciales incorrectas:**
```json
{
  "success": false,
  "message": "Credenciales incorrectas",
  "code": "UNAUTHORIZED",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 401 — Cuenta bloqueada:**
```json
{
  "success": false,
  "message": "Cuenta bloqueada temporalmente por intentos fallidos. Intente en 30 minutos.",
  "code": "ACCOUNT_LOCKED",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 422 — Contraseña expirada:**
```json
{
  "success": false,
  "message": "Su contraseña ha expirado. Debe cambiarla para continuar.",
  "code": "CONTRASENA_EXPIRADA",
  "data": {
    "tokenCambio": "temp_change_token_abc123"
  },
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Registra `login` o `login_fallido` en tabla `auditoria`.

---

### `POST /api/v1/auth/logout` 🔑

Revoca el refresh token activo, cerrando la sesión actual.

**Request Body:**
```json
{
  "refreshToken": "d1f3a2b4c5e6..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Sesión cerrada correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Marca el token como `revocado = true` en tabla `tokens`. Registra `logout` en `auditoria`.

---

### `POST /api/v1/auth/refresh` 🌐

Emite un nuevo access token usando el refresh token. El refresh token anterior se invalida (rotación).

**Request Body:**
```json
{
  "refreshToken": "d1f3a2b4c5e6..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "f7g8h9i0j1k2...",
    "expiresIn": 900
  },
  "message": "Token renovado correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 401 — Token inválido o revocado:**
```json
{
  "success": false,
  "message": "El token de refresco no es válido o ha expirado",
  "code": "UNAUTHORIZED",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

### `POST /api/v1/auth/recuperar-contrasena` 🌐

Envía un correo con enlace de recuperación. El enlace expira en 1 hora.

**Rate limiting:** 3 intentos por IP por hora.

**Request Body:**
```json
{
  "email": "jperez@alcaldia.gov.co"
}
```

**Response 200** (respuesta idéntica exista o no el email — evita enumeración de cuentas):
```json
{
  "success": true,
  "data": null,
  "message": "Si el correo está registrado, recibirá un enlace de recuperación en los próximos minutos.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

### `POST /api/v1/auth/restablecer-contrasena` 🌐

Establece una nueva contraseña usando el token del correo de recuperación.

**Request Body:**
```json
{
  "token": "recovery_token_abc123xyz",
  "nuevaContrasena": "NuevaContrasena456!",
  "confirmarContrasena": "NuevaContrasena456!"
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `token` | string | ✅ | Token del correo de recuperación |
| `nuevaContrasena` | string | ✅ | Mín. 10 chars, mayúscula, minúscula, número, especial |
| `confirmarContrasena` | string | ✅ | Debe coincidir con `nuevaContrasena` |

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Contraseña restablecida correctamente. Puede iniciar sesión.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 422 — Contraseña reutilizada:**
```json
{
  "success": false,
  "message": "No puede usar una de sus últimas 5 contraseñas",
  "code": "CONTRASENA_REUTILIZADA",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Registra `cambiar_contrasena` en `auditoria`. Revoca todos los refresh tokens activos del usuario.

---

### `POST /api/v1/auth/cambiar-contrasena` 🔑

Cambia la contraseña del usuario autenticado.

**Request Body:**
```json
{
  "contrasenaActual": "MiContrasena123!",
  "nuevaContrasena": "NuevaContrasena456!",
  "confirmarContrasena": "NuevaContrasena456!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Contraseña actualizada correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 401 — Contraseña actual incorrecta:**
```json
{
  "success": false,
  "message": "La contraseña actual no es correcta",
  "code": "UNAUTHORIZED",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Registra `cambiar_contrasena` en `auditoria`. Revoca todos los refresh tokens activos (fuerza nuevo login).

---

### `GET /api/v1/auth/me` 🔑

Retorna el perfil completo del usuario autenticado.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "jperez@alcaldia.gov.co",
    "rol": {
      "id": "rol-uuid",
      "nombre": "funcionario"
    },
    "dependencia": {
      "id": "dep-uuid",
      "nombre": "Secretaría de Movilidad",
      "codigo": "SM-001"
    },
    "activo": true,
    "ultimoLogin": "2026-08-01T08:15:00Z",
    "contrasenaExpiraAt": "2026-11-01"
  },
  "message": "Perfil obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

## 7. Módulo USUARIOS — Gestión de Usuarios

> Todos los endpoints de este módulo requieren rol `administrador` 🛡️

---

### `GET /api/v1/usuarios` 🛡️

Lista todos los usuarios del sistema con paginación y filtros.

**Query Params:**
```
?page=1&limit=20&sortBy=apellido&sortOrder=ASC
&rolId=uuid
&dependenciaId=uuid
&activo=true
&busqueda=juan        ← busca en nombre, apellido o email
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "jperez@alcaldia.gov.co",
      "rol": { "id": "uuid", "nombre": "funcionario" },
      "dependencia": { "id": "uuid", "nombre": "Secretaría de Movilidad" },
      "activo": true,
      "ultimoLogin": "2026-08-01T08:15:00Z",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "message": "Usuarios obtenidos correctamente",
  "timestamp": "2026-08-02T19:30:00Z",
  "pagination": { "page": 1, "limit": 20, "total": 8, "totalPages": 1, "hasNext": false, "hasPrev": false }
}
```

> Nunca se incluyen `contrasena_hash`, `historial_contrasenas`, ni `bloqueado_hasta` en las respuestas.

---

### `GET /api/v1/usuarios/{id}` 🛡️

Obtiene el detalle de un usuario por su UUID.

**Path Params:** `id` — UUID del usuario

**Response 200:** Mismo objeto que el item del listado, con campo adicional:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "jperez@alcaldia.gov.co",
    "rol": { "id": "uuid", "nombre": "funcionario" },
    "dependencia": { "id": "uuid", "nombre": "Secretaría de Movilidad" },
    "activo": true,
    "ultimoLogin": "2026-08-01T08:15:00Z",
    "intentosFallidos": 0,
    "contrasenaExpiraAt": "2026-11-01",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-07-10T14:30:00Z"
  },
  "message": "Usuario obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 404:**
```json
{ "success": false, "message": "Usuario no encontrado", "code": "NOT_FOUND", "timestamp": "..." }
```

---

### `POST /api/v1/usuarios` 🛡️

Crea un nuevo usuario funcionario o administrador.

**Request Body:**
```json
{
  "nombre": "María",
  "apellido": "González",
  "email": "mgonzalez@alcaldia.gov.co",
  "rolId": "uuid-rol-funcionario",
  "dependenciaId": "uuid-dependencia"
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `nombre` | string | ✅ | 2–100 chars, sin números |
| `apellido` | string | ✅ | 2–100 chars, sin números |
| `email` | string | ✅ | Email institucional válido, único |
| `rolId` | UUID | ✅ | UUID de rol existente y activo |
| `dependenciaId` | UUID | ❌ | UUID de dependencia existente y activa |

**Comportamiento:** El sistema genera una contraseña temporal y la envía por correo. El usuario deberá cambiarla en el primer ingreso.

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "María",
    "apellido": "González",
    "email": "mgonzalez@alcaldia.gov.co",
    "rol": { "id": "uuid", "nombre": "funcionario" },
    "activo": true,
    "createdAt": "2026-08-02T19:30:00Z"
  },
  "message": "Usuario creado correctamente. Se envió la contraseña temporal al correo registrado.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 409 — Email ya registrado:**
```json
{ "success": false, "message": "El correo electrónico ya está registrado", "code": "EMAIL_IN_USE", "timestamp": "..." }
```

**Efectos:** Registra `crear` en `auditoria`.

---

### `PUT /api/v1/usuarios/{id}` 🛡️

Actualiza los datos de un usuario existente.

**Request Body:**
```json
{
  "nombre": "María Camila",
  "apellido": "González Ruiz",
  "rolId": "uuid-rol",
  "dependenciaId": "uuid-dep"
}
```

> No permite cambiar el `email` ni la contraseña a través de este endpoint.

**Response 200:** Objeto del usuario actualizado.

**Efectos:** Registra `editar` en `auditoria` con `datos_anteriores` y `datos_nuevos`.

---

### `PATCH /api/v1/usuarios/{id}/activar` 🛡️

Activa o desactiva una cuenta de usuario.

**Request Body:**
```json
{ "activo": false }
```

**Response 200:**
```json
{
  "success": true,
  "data": { "id": "uuid", "activo": false },
  "message": "Usuario desactivado correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Si se desactiva, revoca todos sus refresh tokens activos. Registra `editar` en `auditoria`.

---

### `DELETE /api/v1/usuarios/{id}` 🛡️

Soft delete de un usuario. Sus registros históricos (auditoría, solicitudes gestionadas) se conservan.

**Response 200:**
```json
{
  "success": true,
  "data": null,
  "message": "Usuario eliminado correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Restricción:** No se puede eliminar el propio usuario autenticado. Devuelve 422 si se intenta.

**Efectos:** Establece `deleted_at`. Registra `eliminar` en `auditoria`.

---

## 8. Módulo ROLES — Roles del Sistema

> Requieren rol `administrador` 🛡️

---

### `GET /api/v1/roles` 🛡️

Lista todos los roles disponibles.

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "nombre": "administrador", "descripcion": "Control total del sistema", "activo": true },
    { "id": "uuid", "nombre": "funcionario", "descripcion": "Gestión de solicitudes y permisos", "activo": true }
  ],
  "message": "Roles obtenidos correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

### `GET /api/v1/roles/{id}` 🛡️

Obtiene un rol por UUID.

**Response 200:** Objeto del rol.

---

### `POST /api/v1/roles` 🛡️

Crea un nuevo rol.

**Request Body:**
```json
{
  "nombre": "supervisor",
  "descripcion": "Supervisión de solicitudes sin capacidad de aprobar"
}
```

**Response 201:** Objeto del rol creado.

---

### `PUT /api/v1/roles/{id}` 🛡️

Actualiza un rol existente.

**Request Body:**
```json
{
  "nombre": "supervisor",
  "descripcion": "Descripción actualizada",
  "activo": true
}
```

**Response 200:** Objeto del rol actualizado.

---

## 9. Módulo DEPENDENCIAS — Dependencias de la Alcaldía

---

### `GET /api/v1/dependencias` 👮

Lista dependencias activas.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Secretaría de Movilidad",
      "codigo": "SM-001",
      "descripcion": "Gestión del tránsito y movilidad",
      "activo": true
    }
  ],
  "message": "Dependencias obtenidas correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

### `POST /api/v1/dependencias` 🛡️

Crea una nueva dependencia.

**Request Body:**
```json
{
  "nombre": "Secretaría de Gobierno",
  "codigo": "SG-002",
  "descripcion": "Gestión del orden público"
}
```

**Response 201:** Objeto de la dependencia creada.

---

### `PUT /api/v1/dependencias/{id}` 🛡️

Actualiza una dependencia.

**Response 200:** Objeto actualizado.

---

### `PATCH /api/v1/dependencias/{id}/activar` 🛡️

Activa o desactiva una dependencia.

**Request Body:** `{ "activo": false }`

**Response 200:** Objeto con estado actualizado.

---

## 10. Módulo MOTIVOS — Motivos de Solicitud

---

### `GET /api/v1/public/motivos` 🌐

Lista los motivos activos para el formulario público del ciudadano.

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "nombre": "Trabajo", "descripcion": null, "requiereSoporte": true, "orden": 1 },
    { "id": "uuid", "nombre": "Emergencia médica", "descripcion": null, "requiereSoporte": false, "orden": 2 },
    { "id": "uuid", "nombre": "Domicilios", "descripcion": null, "requiereSoporte": true, "orden": 4 }
  ],
  "message": "Motivos obtenidos correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

> Solo retorna motivos con `activo = true`, ordenados por `orden ASC`.

---

### `GET /api/v1/motivos` 🛡️

Lista todos los motivos (incluyendo inactivos) para gestión del administrador.

**Query Params:** `?activo=true|false`

**Response 200:** Array de motivos con campo `activo` visible.

---

### `POST /api/v1/motivos` 🛡️

Crea un nuevo motivo.

**Request Body:**
```json
{
  "nombre": "Prestación de servicios de salud",
  "descripcion": "Profesionales del sector salud que deban desplazarse",
  "requiereSoporte": true,
  "orden": 10
}
```

**Response 201:** Objeto del motivo creado.

---

### `PUT /api/v1/motivos/{id}` 🛡️

Actualiza un motivo existente.

**Request Body:**
```json
{
  "nombre": "Prestación de servicios de salud",
  "descripcion": "Descripción actualizada",
  "requiereSoporte": true,
  "orden": 3
}
```

**Response 200:** Objeto del motivo actualizado.

---

### `PATCH /api/v1/motivos/{id}/activar` 🛡️

Activa o desactiva un motivo sin eliminarlo.

**Request Body:** `{ "activo": false }`

**Response 200:** Objeto con estado actualizado.

---

## 11. Módulo CIUDADANOS — Consulta de Ciudadanos

> Los ciudadanos se crean implícitamente al crear una solicitud. No existe endpoint de registro separado.

---

### `GET /api/v1/ciudadanos` 👮

Lista ciudadanos con paginación.

**Query Params:**
```
?page=1&limit=20&busqueda=juan       ← busca en nombre, apellido o número de documento
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tipoDocumento": "CC",
      "numeroDocumento": "12345678",
      "nombre": "Pedro",
      "apellido": "Ramírez",
      "celular": "3001234567",
      "email": "pedro@correo.com",
      "municipio": { "id": "uuid", "nombre": "Pasto", "departamento": "Nariño" },
      "createdAt": "2026-05-10T09:00:00Z"
    }
  ],
  "message": "Ciudadanos obtenidos correctamente",
  "timestamp": "2026-08-02T19:30:00Z",
  "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3, "hasNext": true, "hasPrev": false }
}
```

---

### `GET /api/v1/ciudadanos/{id}` 👮

Obtiene el detalle de un ciudadano por UUID, incluyendo sus solicitudes más recientes.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tipoDocumento": "CC",
    "numeroDocumento": "12345678",
    "nombre": "Pedro",
    "apellido": "Ramírez",
    "fechaNacimiento": "1985-03-15",
    "direccion": "Calle 5 # 10-20",
    "barrio": "Centro",
    "celular": "3001234567",
    "email": "pedro@correo.com",
    "municipio": { "id": "uuid", "nombre": "Pasto", "departamento": "Nariño" },
    "aceptaTratamientoDatos": true,
    "fechaAceptacionDatos": "2026-05-10T09:00:00Z",
    "motocicletas": [
      { "id": "uuid", "placa": "ABC123", "marca": "Yamaha", "modelo": 2022, "activo": true }
    ],
    "totalSolicitudes": 3,
    "createdAt": "2026-05-10T09:00:00Z"
  },
  "message": "Ciudadano obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

### `GET /api/v1/ciudadanos/documento/{numero}` 👮

Busca un ciudadano por número de documento. Útil en el panel del funcionario para verificación rápida.

**Path Params:** `numero` — Número de documento (ej: `12345678`)

**Response 200:** Mismo objeto que el detalle por UUID.

**Response 404:**
```json
{ "success": false, "message": "Ciudadano no encontrado con ese número de documento", "code": "NOT_FOUND", "timestamp": "..." }
```

---

## 12. Módulo MOTOCICLETAS — Consulta de Motocicletas

---

### `GET /api/v1/motocicletas` 👮

Lista motocicletas con paginación.

**Query Params:**
```
?page=1&limit=20&placa=ABC&ciudadanoId=uuid&activo=true
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "placa": "ABC123",
      "marca": "Yamaha",
      "linea": "FZ 150",
      "modelo": 2022,
      "cilindraje": 150,
      "color": "Azul",
      "numeroMotor": "YAMFZ2022001",
      "numeroChasis": "CHS2022001",
      "activo": true,
      "ciudadano": {
        "id": "uuid",
        "nombre": "Pedro",
        "apellido": "Ramírez",
        "numeroDocumento": "12345678"
      }
    }
  ],
  "message": "Motocicletas obtenidas correctamente",
  "timestamp": "2026-08-02T19:30:00Z",
  "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1, "hasNext": false, "hasPrev": false }
}
```

---

### `GET /api/v1/motocicletas/{id}` 👮

Obtiene el detalle de una motocicleta por UUID.

**Response 200:** Objeto completo de la moto más datos del ciudadano propietario.

---

### `GET /api/v1/motocicletas/placa/{placa}` 👮

Busca una motocicleta por su placa. La placa se normaliza a mayúsculas.

**Path Params:** `placa` — Placa colombiana (ej: `ABC123`)

**Response 200:** Objeto de la moto con datos del ciudadano.

**Response 404:**
```json
{ "success": false, "message": "No se encontró motocicleta con la placa indicada", "code": "NOT_FOUND", "timestamp": "..." }
```

---

### `PUT /api/v1/motocicletas/{id}` 👮

Actualiza los datos de una motocicleta. Solo el funcionario puede corregir datos de moto; el ciudadano no puede hacerlo directamente.

**Request Body:**
```json
{
  "marca": "Yamaha",
  "linea": "FZ 150i",
  "modelo": 2022,
  "cilindraje": 150,
  "color": "Azul metálico",
  "numeroMotor": "YAMFZ2022001",
  "numeroChasis": "CHS2022001"
}
```

> No se permite cambiar la `placa` ni el `ciudadano_id` a través de este endpoint.

**Response 200:** Objeto actualizado.

**Efectos:** Registra `editar` en `auditoria`.

---

## 13. Módulo SOLICITUDES — Flujo de Trámite

---

### `POST /api/v1/public/solicitudes` 🌐

Crea una nueva solicitud de permiso de circulación. Es el punto de entrada del ciudadano.

**Rate limiting:** 5 solicitudes por IP por hora.  
**reCAPTCHA:** El token de reCAPTCHA v3 es obligatorio.

**Request Body:**
```json
{
  "recaptchaToken": "03AGdBq27Sc...",
  "ciudadano": {
    "tipoDocumento": "CC",
    "numeroDocumento": "12345678",
    "nombre": "Pedro Antonio",
    "apellido": "Ramírez Gómez",
    "fechaNacimiento": "1985-03-15",
    "direccion": "Calle 5 # 10-20",
    "barrio": "Centro",
    "municipioId": "uuid-municipio",
    "celular": "3001234567",
    "email": "pedro@correo.com",
    "aceptaTratamientoDatos": true
  },
  "motocicleta": {
    "placa": "ABC123",
    "marca": "Yamaha",
    "linea": "FZ 150",
    "modelo": 2022,
    "cilindraje": 150,
    "color": "Azul",
    "numeroMotor": "YAMFZ2022001",
    "numeroChasis": "CHS2022001"
  },
  "solicitud": {
    "motivoId": "uuid-motivo",
    "fechaInicio": "2026-08-10",
    "fechaFin": "2026-08-25",
    "descripcionAdicional": "Trabajo como mensajero en empresa XYZ, horario de 6am a 6pm",
    "declaracionJurada": true
  }
}
```

**Validaciones del request:**

| Campo | Validación |
|-------|-----------|
| `recaptchaToken` | Token válido de reCAPTCHA v3 (score ≥ 0.5) |
| `ciudadano.tipoDocumento` | `CC` / `CE` / `PAS` / `TI` / `NIT` |
| `ciudadano.numeroDocumento` | Solo dígitos, 5–20 chars |
| `ciudadano.nombre` | 2–100 chars |
| `ciudadano.apellido` | 2–100 chars |
| `ciudadano.email` | Email válido |
| `ciudadano.aceptaTratamientoDatos` | Debe ser `true` — obligatorio por Ley 1581 |
| `motocicleta.placa` | Formato colombiano: `[A-Z]{3}[0-9]{2}[A-Z0-9]` |
| `solicitud.motivoId` | UUID de motivo activo |
| `solicitud.fechaInicio` | Fecha futura, formato `YYYY-MM-DD` |
| `solicitud.fechaFin` | Mayor o igual a `fechaInicio` |
| `solicitud.fechaFin - fechaInicio` | Máximo `dias_max_permiso` días (valor de configuración) |
| `solicitud.declaracionJurada` | Debe ser `true` |

**Lógica de negocio:**
- Si el ciudadano ya existe (por `numeroDocumento`), se actualiza con los nuevos datos y se reutiliza.
- Si la moto ya existe (por `placa`), se vincula al ciudadano y se reutiliza.
- Si la moto ya tiene una solicitud activa (`recibida`, `en_revision`, `pendiente_correccion`) → Error 409.
- Se genera el `numero_radicado` con formato `AAAAMMDD-PYP-XXXXXX`.
- Se encola notificación de correo al ciudadano con el número de radicado.

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-solicitud",
    "numeroRadicado": "20260802-PYP-000145",
    "estado": "recibida",
    "ciudadano": {
      "nombre": "Pedro Antonio",
      "apellido": "Ramírez Gómez",
      "email": "pedro@correo.com"
    },
    "motocicleta": {
      "placa": "ABC123",
      "marca": "Yamaha"
    },
    "motivo": "Trabajo",
    "fechaInicio": "2026-08-10",
    "fechaFin": "2026-08-25",
    "createdAt": "2026-08-02T19:30:00Z"
  },
  "message": "Su solicitud fue recibida correctamente. Número de radicado: 20260802-PYP-000145. Recibirá un correo de confirmación.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 409 — Solicitud ya activa:**
```json
{
  "success": false,
  "message": "La motocicleta ABC123 ya tiene una solicitud activa en proceso. Radicado: 20260801-PYP-000120",
  "code": "CONFLICT",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Registra `crear` en `auditoria` (usuario_id = NULL para acción pública).

---

### `GET /api/v1/public/solicitudes/estado` 🌐

Permite al ciudadano consultar el estado de su solicitud sin login.

**Rate limiting:** 10 consultas por IP por minuto.

**Query Params:**
```
?radicado=20260802-PYP-000145&documento=12345678
```

**Response 200 — Solicitud encontrada:**
```json
{
  "success": true,
  "data": {
    "numeroRadicado": "20260802-PYP-000145",
    "estado": "en_revision",
    "estadoDescripcion": "Su solicitud está siendo revisada por un funcionario.",
    "fechaSolicitud": "2026-08-02",
    "motivo": "Trabajo",
    "motocicleta": { "placa": "ABC123" },
    "fechaInicio": "2026-08-10",
    "fechaFin": "2026-08-25",
    "permiso": null,
    "ultimaActualizacion": "2026-08-02T20:00:00Z"
  },
  "message": "Estado de solicitud obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 200 — Solicitud aprobada (con permiso):**
```json
{
  "success": true,
  "data": {
    "numeroRadicado": "20260802-PYP-000145",
    "estado": "aprobada",
    "estadoDescripcion": "Su solicitud fue aprobada. Puede descargar su permiso.",
    "permiso": {
      "codigoPermiso": "2026-PYP-00145",
      "fechaExpedicion": "2026-08-03",
      "fechaVencimiento": "2026-08-25",
      "estadoPermiso": "vigente",
      "urlDescarga": "/api/v1/public/permisos/descargar/20260802-PYP-000145?doc=12345678"
    }
  },
  "message": "Estado de solicitud obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 404 — No encontrada:**
```json
{
  "success": false,
  "message": "No se encontró ninguna solicitud con ese número de radicado y documento",
  "code": "NOT_FOUND",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

> Por seguridad, la respuesta 404 no revela si el radicado existe pero el documento no coincide.

---

### `GET /api/v1/solicitudes` 👮

Lista solicitudes con filtros y paginación para el panel del funcionario.

**Query Params:**
```
?page=1&limit=20&sortBy=created_at&sortOrder=ASC
&estado=recibida,en_revision
&fechaInicio=2026-08-01
&fechaFin=2026-08-31
&documento=12345678
&placa=ABC123
&radicado=20260802-PYP
&motivoId=uuid
```

> Por defecto retorna solicitudes con `estado IN ('recibida','en_revision','pendiente_correccion')`, ordenadas por antigüedad (las más viejas primero — cola de trabajo).

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "numeroRadicado": "20260802-PYP-000145",
      "estado": "recibida",
      "ciudadano": {
        "nombre": "Pedro Antonio Ramírez Gómez",
        "numeroDocumento": "12345678",
        "email": "pedro@correo.com",
        "celular": "3001234567"
      },
      "motocicleta": { "placa": "ABC123", "marca": "Yamaha", "modelo": 2022 },
      "motivo": "Trabajo",
      "fechaInicio": "2026-08-10",
      "fechaFin": "2026-08-25",
      "tiempoEspera": "2 horas",
      "createdAt": "2026-08-02T17:30:00Z"
    }
  ],
  "message": "Solicitudes obtenidas correctamente",
  "timestamp": "2026-08-02T19:30:00Z",
  "pagination": { "page": 1, "limit": 20, "total": 34, "totalPages": 2, "hasNext": true, "hasPrev": false }
}
```

---

### `GET /api/v1/solicitudes/{id}` 👮

Obtiene el detalle completo de una solicitud para revisión del funcionario.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numeroRadicado": "20260802-PYP-000145",
    "estado": "en_revision",
    "ciudadano": {
      "id": "uuid",
      "tipoDocumento": "CC",
      "numeroDocumento": "12345678",
      "nombre": "Pedro Antonio",
      "apellido": "Ramírez Gómez",
      "fechaNacimiento": "1985-03-15",
      "direccion": "Calle 5 # 10-20",
      "barrio": "Centro",
      "municipio": "Pasto, Nariño",
      "celular": "3001234567",
      "email": "pedro@correo.com"
    },
    "motocicleta": {
      "id": "uuid",
      "placa": "ABC123",
      "marca": "Yamaha",
      "linea": "FZ 150",
      "modelo": 2022,
      "cilindraje": 150,
      "color": "Azul",
      "numeroMotor": "YAMFZ2022001",
      "numeroChasis": "CHS2022001"
    },
    "motivo": { "id": "uuid", "nombre": "Trabajo", "requiereSoporte": true },
    "fechaInicio": "2026-08-10",
    "fechaFin": "2026-08-25",
    "descripcionAdicional": "Trabajo como mensajero en empresa XYZ",
    "declaracionJurada": true,
    "documentos": [
      {
        "id": "uuid",
        "tipoDocumento": "cedula",
        "nombreOriginal": "cedula_pedro.pdf",
        "mimeType": "application/pdf",
        "tamanoBytes": 245678,
        "activo": true,
        "createdAt": "2026-08-02T17:31:00Z"
      },
      {
        "id": "uuid",
        "tipoDocumento": "carta_laboral",
        "nombreOriginal": "carta_empresa_xyz.pdf",
        "mimeType": "application/pdf",
        "tamanoBytes": 189432,
        "activo": true,
        "createdAt": "2026-08-02T17:31:00Z"
      }
    ],
    "historial": [
      {
        "estadoAnterior": null,
        "estadoNuevo": "recibida",
        "motivo": null,
        "usuario": null,
        "createdAt": "2026-08-02T17:30:00Z"
      },
      {
        "estadoAnterior": "recibida",
        "estadoNuevo": "en_revision",
        "motivo": null,
        "usuario": { "nombre": "Juan", "apellido": "Pérez" },
        "createdAt": "2026-08-02T18:00:00Z"
      }
    ],
    "permiso": null,
    "createdAt": "2026-08-02T17:30:00Z",
    "updatedAt": "2026-08-02T18:00:00Z"
  },
  "message": "Solicitud obtenida correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efecto secundario:** Si la solicitud estaba en `recibida`, cambia automáticamente a `en_revision` al ser abierta por un funcionario. Registra en `historial_estados` y `auditoria`.

---

### `POST /api/v1/solicitudes/{id}/aprobar` 👮

Aprueba una solicitud y dispara la generación asíncrona del permiso (PDF + QR).

**Restricción:** La solicitud debe estar en estado `en_revision`.

**Request Body:** *(sin body — la aprobación no requiere motivo)*

**Response 202 — Aceptado, procesando:**
```json
{
  "success": true,
  "data": {
    "solicitudId": "uuid",
    "numeroRadicado": "20260802-PYP-000145",
    "estado": "aprobada",
    "mensaje": "La solicitud fue aprobada. El permiso está siendo generado."
  },
  "message": "Solicitud aprobada. El permiso se generará en breve y se notificará al ciudadano.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 422 — Estado inválido:**
```json
{
  "success": false,
  "message": "La solicitud no puede aprobarse porque su estado actual es 'rechazada'",
  "code": "SOLICITUD_ESTADO_INVALIDO",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:**
- Cambia `estado` a `aprobada`.
- Registra en `historial_estados` y `auditoria`.
- Encola job de generación de PDF + QR (respuesta 202 = procesamiento asíncrono).
- Al completarse el job: crea registro en `permisos`, encola correo al ciudadano.

---

### `POST /api/v1/solicitudes/{id}/rechazar` 👮

Rechaza una solicitud de forma definitiva.

**Restricción:** La solicitud debe estar en estado `en_revision` o `pendiente_correccion`.

**Request Body:**
```json
{
  "motivo": "Los documentos adjuntos no corresponden a los requeridos para el motivo de Trabajo. La carta laboral presentada no tiene membrete ni firma del empleador."
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `motivo` | string | ✅ | 20–1000 chars |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "solicitudId": "uuid",
    "numeroRadicado": "20260802-PYP-000145",
    "estado": "rechazada"
  },
  "message": "Solicitud rechazada correctamente. Se notificará al ciudadano.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Registra en `historial_estados` con el motivo. Registra `rechazar` en `auditoria`. Encola correo al ciudadano con el motivo del rechazo.

---

### `POST /api/v1/solicitudes/{id}/correccion` 👮

Solicita al ciudadano que corrija datos o documentos específicos.

**Restricción:** La solicitud debe estar en estado `en_revision`.

**Request Body:**
```json
{
  "motivo": "Los documentos adjuntos están incompletos.",
  "camposCorreccion": [
    { "campo": "soat", "descripcion": "El SOAT adjunto está vencido. Debe adjuntar el SOAT vigente." },
    { "campo": "carta_laboral", "descripcion": "La carta laboral no tiene sello de la empresa." }
  ]
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `motivo` | string | ✅ | 20–500 chars |
| `camposCorreccion` | array | ✅ | Al menos 1 ítem |
| `camposCorreccion[].campo` | string | ✅ | Nombre del campo o tipo de documento |
| `camposCorreccion[].descripcion` | string | ✅ | Instrucción clara para el ciudadano |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "solicitudId": "uuid",
    "numeroRadicado": "20260802-PYP-000145",
    "estado": "pendiente_correccion"
  },
  "message": "Solicitud marcada para corrección. Se notificará al ciudadano.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Cambia estado a `pendiente_correccion`. El ciudadano tiene `plazo_correccion_dias` días para corregir (configuración). Encola correo con los campos específicos a corregir.

---

### `GET /api/v1/solicitudes/{id}/historial` 👮

Retorna el historial completo de cambios de estado de una solicitud.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "estadoAnterior": null,
      "estadoNuevo": "recibida",
      "motivo": null,
      "camposCorreccion": null,
      "usuario": null,
      "ipAddress": "192.168.1.100",
      "createdAt": "2026-08-02T17:30:00Z"
    },
    {
      "id": "uuid",
      "estadoAnterior": "recibida",
      "estadoNuevo": "en_revision",
      "motivo": null,
      "camposCorreccion": null,
      "usuario": { "id": "uuid", "nombre": "Juan Pérez", "rol": "funcionario" },
      "ipAddress": "10.0.1.5",
      "createdAt": "2026-08-02T18:00:00Z"
    },
    {
      "id": "uuid",
      "estadoAnterior": "en_revision",
      "estadoNuevo": "aprobada",
      "motivo": null,
      "camposCorreccion": null,
      "usuario": { "id": "uuid", "nombre": "Juan Pérez", "rol": "funcionario" },
      "ipAddress": "10.0.1.5",
      "createdAt": "2026-08-02T19:25:00Z"
    }
  ],
  "message": "Historial obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

### `POST /api/v1/solicitudes/{id}/documentos` 🌐

Adjunta un documento a una solicitud. Solo el ciudadano puede hacerlo y solo cuando la solicitud está en `recibida` o `pendiente_correccion`.

**Content-Type:** `multipart/form-data`

**Form Fields:**
```
tipoDocumento: "soat"
archivo: [binary file]
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `tipoDocumento` | string | ✅ | Valor del ENUM `tipo_documento_adjunto` |
| `archivo` | file | ✅ | PDF / JPG / PNG. Máx. 10 MB |

**Validación adicional:** El radicado y número de documento se envían como query params para identificar al ciudadano sin login:
```
POST /api/v1/solicitudes/{id}/documentos?radicado=20260802-PYP-000145&documento=12345678
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tipoDocumento": "soat",
    "nombreOriginal": "SOAT_ABC123_2026.pdf",
    "mimeType": "application/pdf",
    "tamanoBytes": 312450,
    "createdAt": "2026-08-02T19:30:00Z"
  },
  "message": "Documento adjuntado correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

> `storage_key` nunca se incluye en la respuesta.

---

### `GET /api/v1/solicitudes/{id}/documentos` 👮

Lista los documentos adjuntos de una solicitud (sin URLs de descarga directa).

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tipoDocumento": "cedula",
      "nombreOriginal": "cedula_pedro.pdf",
      "mimeType": "application/pdf",
      "tamanoBytes": 245678,
      "activo": true,
      "createdAt": "2026-08-02T17:31:00Z"
    }
  ],
  "message": "Documentos obtenidos correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

### `GET /api/v1/solicitudes/{id}/documentos/{docId}` 👮

Genera y retorna una URL firmada temporal para descargar un documento adjunto.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.dominio.gov.co/docs/signed/abc123...?expires=1754154600&sig=xyz",
    "expiraEn": "2026-08-02T19:35:00Z",
    "nombreOriginal": "cedula_pedro.pdf",
    "mimeType": "application/pdf"
  },
  "message": "URL de descarga generada. Válida por 5 minutos.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

> La URL expira en 5 minutos. `storage_key` nunca se expone.

**Efectos:** Registra descarga en `auditoria`.

---

## 14. Módulo PERMISOS — Permisos Generados

---

### `GET /api/v1/permisos` 👮

Lista permisos generados con filtros y paginación.

**Query Params:**
```
?page=1&limit=20&sortBy=fecha_expedicion&sortOrder=DESC
&estado=vigente
&fechaInicio=2026-08-01
&fechaFin=2026-08-31
&placa=ABC123
&documento=12345678
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "codigoPermiso": "2026-PYP-00145",
      "estado": "vigente",
      "ciudadano": {
        "nombre": "Pedro Antonio Ramírez Gómez",
        "numeroDocumento": "12345678"
      },
      "motocicleta": { "placa": "ABC123" },
      "motivo": "Trabajo",
      "fechaExpedicion": "2026-08-02T19:30:00Z",
      "fechaVencimiento": "2026-08-25",
      "funcionario": { "nombre": "Juan", "apellido": "Pérez" }
    }
  ],
  "message": "Permisos obtenidos correctamente",
  "timestamp": "2026-08-02T19:30:00Z",
  "pagination": { "page": 1, "limit": 20, "total": 87, "totalPages": 5, "hasNext": true, "hasPrev": false }
}
```

---

### `GET /api/v1/permisos/{id}` 👮

Obtiene el detalle completo de un permiso.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "codigoPermiso": "2026-PYP-00145",
    "estado": "vigente",
    "snapshotCiudadano": {
      "tipoDocumento": "CC",
      "numeroDocumento": "12345678",
      "nombre": "Pedro Antonio",
      "apellido": "Ramírez Gómez",
      "celular": "3001234567",
      "email": "pedro@correo.com"
    },
    "snapshotMotocicleta": {
      "placa": "ABC123",
      "marca": "Yamaha",
      "linea": "FZ 150",
      "modelo": 2022,
      "color": "Azul"
    },
    "snapshotMotivo": { "nombre": "Trabajo" },
    "fechaExpedicion": "2026-08-02T19:30:00Z",
    "fechaVencimiento": "2026-08-25",
    "funcionario": {
      "id": "uuid",
      "nombre": "Juan",
      "apellido": "Pérez",
      "dependencia": "Secretaría de Movilidad"
    },
    "solicitudId": "uuid",
    "numeroRadicado": "20260802-PYP-000145",
    "condicionesRestricciones": null,
    "motivo_revocacion": null,
    "revocado_at": null,
    "createdAt": "2026-08-02T19:30:00Z"
  },
  "message": "Permiso obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

> `codigo_qr` y `storage_key_pdf` nunca se exponen en esta respuesta.

---

### `GET /api/v1/permisos/{id}/pdf` 👮

Genera y retorna una URL firmada para descargar el PDF del permiso.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.dominio.gov.co/pdfs/signed/2026-PYP-00145.pdf?expires=...&sig=...",
    "expiraEn": "2026-08-02T19:35:00Z",
    "codigoPermiso": "2026-PYP-00145",
    "nombreArchivo": "Permiso_2026-PYP-00145.pdf"
  },
  "message": "URL de descarga del permiso generada. Válida por 5 minutos.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Registra `generar_permiso` (descarga) en `auditoria`.

---

### `POST /api/v1/permisos/{id}/revocar` 🛡️

Revoca un permiso vigente. Solo el administrador puede ejecutar esta acción.

**Restricción:** El permiso debe estar en estado `vigente`.

**Request Body:**
```json
{
  "motivoRevocacion": "El ciudadano presentó documentos falsos. Se inicia proceso sancionatorio según Resolución 001-2026."
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `motivoRevocacion` | string | ✅ | 20–1000 chars |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "codigoPermiso": "2026-PYP-00145",
    "estado": "revocado",
    "motivoRevocacion": "El ciudadano presentó documentos falsos...",
    "revocadoAt": "2026-08-02T19:30:00Z",
    "revocadoPor": { "nombre": "Carlos", "apellido": "Mora", "rol": "administrador" }
  },
  "message": "Permiso revocado correctamente. El código QR ya no es válido.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 422 — Permiso ya vencido:**
```json
{
  "success": false,
  "message": "El permiso ya está vencido y no puede ser revocado",
  "code": "PERMISO_YA_VENCIDO",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Registra `revocar_permiso` en `auditoria`. El `codigo_qr` queda inválido de inmediato.

---

### `PATCH /api/v1/permisos/{id}/condiciones` 👮

Registra o actualiza las condiciones y restricciones específicas de un permiso. Solo disponible para funcionarios y administradores. Puede usarse al aprobar o con posterioridad (ej: corregir una condición). No regenera el PDF (RN-33).

**Restricción:** El permiso debe estar en estado `vigente`.

**Request Body:**
```json
{
  "condicionesRestricciones": "Válido únicamente entre 06:00 y 18:00. Portar cédula de ciudadanía en todo momento."
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `condicionesRestricciones` | string \| null | ✅ | Max 500 chars. Enviar `null` para eliminar el campo |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "codigoPermiso": "2026-PYP-00145",
    "condicionesRestricciones": "Válido únicamente entre 06:00 y 18:00. Portar cédula de ciudadanía en todo momento."
  },
  "message": "Condiciones y restricciones del permiso actualizadas correctamente.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 422 — Permiso no vigente:**
```json
{
  "success": false,
  "message": "Solo se pueden editar condiciones de permisos vigentes",
  "code": "PERMISO_NO_VIGENTE",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Registra `editar_condiciones_permiso` en `auditoria` con el valor anterior y el nuevo valor. El código QR reflejará el nuevo valor inmediatamente (RN-39).

---

### `GET /api/v1/public/verificar/{codigoQR}` 🌐

Valida la autenticidad de un permiso escaneando su QR. Endpoint público optimizado para móvil.

**Rate limiting:** 30 consultas por IP por minuto.

**Path Params:** `codigoQR` — Identificador opaco del QR (UUID+hash)

**Response 200 — Permiso VIGENTE:**
```json
{
  "success": true,
  "data": {
    "resultado": "vigente",
    "codigoPermiso": "2026-PYP-00145",
    "titular": "Pedro Antonio Ramírez Gómez",
    "tipoDocumento": "CC",
    "numeroDocumento": "12345678",
    "placa": "ABC123",
    "marca": "Yamaha",
    "linea": "FZ 150",
    "modelo": 2022,
    "color": "Azul",
    "motivo": "Trabajo",
    "fechaExpedicion": "2026-08-02",
    "fechaVencimiento": "2026-08-25",
    "estadoPermiso": "VIGENTE",
    "funcionarioAutorizo": "Juan Pérez — Secretaría de Movilidad",
    "condicionesRestricciones": null
  },
  "message": "Permiso vigente y válido",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 200 — Permiso VENCIDO:**
```json
{
  "success": true,
  "data": {
    "resultado": "vencido",
    "codigoPermiso": "2026-PYP-00100",
    "estadoPermiso": "VENCIDO",
    "fechaVencimiento": "2026-07-31",
    "mensaje": "Este permiso venció el 31 de julio de 2026 y ya no es válido."
  },
  "message": "El permiso ha vencido",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 200 — Permiso REVOCADO:**
```json
{
  "success": true,
  "data": {
    "resultado": "revocado",
    "codigoPermiso": "2026-PYP-00080",
    "estadoPermiso": "REVOCADO",
    "mensaje": "Este permiso fue revocado por la autoridad competente y no es válido."
  },
  "message": "El permiso ha sido revocado",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Response 200 — QR NO ENCONTRADO:**
```json
{
  "success": true,
  "data": {
    "resultado": "no_encontrado",
    "mensaje": "El código QR escaneado no corresponde a ningún permiso registrado en el sistema."
  },
  "message": "Código QR no encontrado",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

> Todos los casos retornan HTTP 200 — el resultado se comunica en `data.resultado`. Esto evita que los códigos HTTP filtren información.

**Efectos:** Registra en `qr_validaciones`: IP, user_agent, resultado, fecha.

---

## 15. Módulo DASHBOARD — Indicadores

---

### `GET /api/v1/dashboard` 👮

Indicadores del día para el panel del funcionario.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "fecha": "2026-08-02",
    "solicitudes": {
      "recibidas": 12,
      "enRevision": 5,
      "pendienteCorreccion": 3,
      "aprobadasHoy": 8,
      "rechazadasHoy": 2,
      "vencidasHoy": 1,
      "totalActivas": 20
    },
    "permisos": {
      "generadosHoy": 8,
      "vigenteTotal": 145,
      "vencidosHoy": 3
    },
    "alertas": [
      {
        "tipo": "solicitud_sin_atencion",
        "mensaje": "3 solicitudes llevan más de 24 horas sin atención",
        "count": 3
      }
    ]
  },
  "message": "Dashboard obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

### `GET /api/v1/dashboard/admin` 🛡️

Indicadores globales y de gestión para el administrador.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "fecha": "2026-08-02",
    "usuarios": {
      "totalActivos": 8,
      "funcionariosActivos": 6,
      "administradoresActivos": 2
    },
    "solicitudes": {
      "totalHistorico": 1245,
      "estesMes": 87,
      "tasaAprobacion": 78.5,
      "tiempoPromedioRevisionHoras": 4.2
    },
    "permisos": {
      "vigenteTotal": 145,
      "vencidosTotal": 980,
      "revocadosTotal": 12
    },
    "motivosMasFrecuentes": [
      { "motivo": "Trabajo", "cantidad": 450, "porcentaje": 36.1 },
      { "motivo": "Domicilios", "cantidad": 280, "porcentaje": 22.5 },
      { "motivo": "Prestación de servicios", "cantidad": 195, "porcentaje": 15.7 }
    ],
    "actividadPorFuncionario": [
      { "funcionario": "Juan Pérez", "revisadas": 45, "aprobadas": 38, "rechazadas": 7 }
    ]
  },
  "message": "Dashboard administrativo obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

## 16. Módulo REPORTES — Reportes y Exportaciones

> Todos requieren rol `administrador` 🛡️

---

### `GET /api/v1/reportes/solicitudes` 🛡️

Reporte de solicitudes con filtros avanzados.

**Query Params:**
```
?page=1&limit=50
&estado=aprobada
&fechaInicio=2026-01-01&fechaFin=2026-08-31
&motivoId=uuid
&funcionarioId=uuid
&placa=ABC123
&documento=12345678
```

**Response 200:** Estructura de paginación estándar con datos de solicitudes.

---

### `GET /api/v1/reportes/permisos-vigentes` 🛡️

Lista todos los permisos actualmente vigentes.

**Query Params:** `?page=1&limit=50&placa=&documento=`

**Response 200:** Paginación estándar con permisos vigentes.

---

### `GET /api/v1/reportes/permisos-vencidos` 🛡️

Lista permisos vencidos en un rango de fechas.

**Query Params:** `?page=1&limit=50&fechaInicio=&fechaFin=`

---

### `GET /api/v1/reportes/motivos` 🛡️

Frecuencia y estadísticas por motivo de solicitud.

**Query Params:** `?fechaInicio=2026-01-01&fechaFin=2026-08-31`

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "motivoId": "uuid", "nombre": "Trabajo", "total": 450, "aprobadas": 380, "rechazadas": 45, "pendientes": 25, "porcentajeAprobacion": 84.4 },
    { "motivoId": "uuid", "nombre": "Domicilios", "total": 280, "aprobadas": 240, "rechazadas": 30, "pendientes": 10, "porcentajeAprobacion": 85.7 }
  ],
  "message": "Reporte de motivos obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

### `GET /api/v1/reportes/funcionarios` 🛡️

Actividad y métricas por funcionario.

**Query Params:** `?fechaInicio=&fechaFin=&funcionarioId=`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "funcionarioId": "uuid",
      "nombre": "Juan Pérez",
      "dependencia": "Secretaría de Movilidad",
      "totalRevisadas": 145,
      "aprobadas": 120,
      "rechazadas": 18,
      "correcciones": 7,
      "tiempoPromedioRevisionHoras": 3.8,
      "tasaAprobacion": 82.8
    }
  ],
  "message": "Reporte de funcionarios obtenido correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

### `POST /api/v1/reportes/exportar` 🛡️

Genera y retorna un archivo de reporte en el formato solicitado.

**Request Body:**
```json
{
  "tipo": "solicitudes",
  "formato": "excel",
  "filtros": {
    "fechaInicio": "2026-01-01",
    "fechaFin": "2026-08-02",
    "estado": "aprobada",
    "motivoId": null,
    "funcionarioId": null
  }
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `tipo` | string | ✅ | `solicitudes` / `permisos` / `motivos` / `funcionarios` |
| `formato` | string | ✅ | `excel` / `pdf` / `csv` |
| `filtros` | object | ✅ | Al menos `fechaInicio` y `fechaFin` |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.dominio.gov.co/reportes/signed/reporte_solicitudes_20260802.xlsx?expires=...&sig=...",
    "expiraEn": "2026-08-02T19:35:00Z",
    "nombreArchivo": "Reporte_Solicitudes_2026-01-01_2026-08-02.xlsx",
    "formato": "excel",
    "totalRegistros": 87
  },
  "message": "Reporte generado correctamente. Descarga disponible por 5 minutos.",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Registra `exportar_reporte` en `auditoria`.

---

## 17. Módulo AUDITORÍA — Bitácora

> Requiere rol `administrador` 🛡️

---

### `GET /api/v1/auditoria` 🛡️

Lista la bitácora de acciones con filtros y paginación.

**Query Params:**
```
?page=1&limit=50&sortBy=created_at&sortOrder=DESC
&usuarioId=uuid
&accion=aprobar
&entidad=solicitud
&fechaInicio=2026-08-01T00:00:00Z
&fechaFin=2026-08-02T23:59:59Z
&ipAddress=192.168.1.100
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "usuario": { "id": "uuid", "nombre": "Juan Pérez", "rol": "funcionario" },
      "accion": "aprobar",
      "entidad": "solicitud",
      "entidadId": "uuid-solicitud",
      "datosAnteriores": { "estado": "en_revision" },
      "datosNuevos": { "estado": "aprobada" },
      "ipAddress": "10.0.1.5",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "createdAt": "2026-08-02T19:25:00Z"
    }
  ],
  "message": "Bitácora obtenida correctamente",
  "timestamp": "2026-08-02T19:30:00Z",
  "pagination": { "page": 1, "limit": 50, "total": 2847, "totalPages": 57, "hasNext": true, "hasPrev": false }
}
```

> Los campos `datosAnteriores` y `datosNuevos` tienen enmascarados los campos sensibles (`contrasena_hash`, `historial_contrasenas`).

---

## 18. Módulo CONFIGURACIÓN — Parámetros del Sistema

---

### `GET /api/v1/configuracion` 🛡️

Obtiene todos los parámetros de configuración del sistema.

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "clave": "nombre_alcaldia", "valor": "Alcaldía Municipal de Pasto", "tipo": "texto", "descripcion": "Nombre institucional en el PDF", "updatedAt": "2026-01-10T10:00:00Z" },
    { "clave": "dias_max_permiso", "valor": "30", "tipo": "numero", "descripcion": "Duración máxima de un permiso en días", "updatedAt": "2026-01-10T10:00:00Z" },
    { "clave": "color_institucional", "valor": "#1a56db", "tipo": "texto", "descripcion": "Color primario de la interfaz", "updatedAt": "2026-01-10T10:00:00Z" }
  ],
  "message": "Configuración obtenida correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

> Los parámetros de tipo `imagen_base64` retornan solo la clave, tipo y descripción — no el valor (puede ser muy grande). Para actualizarlos se usa el endpoint `PUT`.

---

### `PUT /api/v1/configuracion/{clave}` 🛡️

Actualiza el valor de un parámetro por su clave.

**Path Params:** `clave` — Clave del parámetro (ej: `nombre_alcaldia`)

**Request Body:**
```json
{ "valor": "Alcaldía Municipal de Pasto — Nariño" }
```

Para parámetros de imagen (`firma_url`, `sello_url`, `logo_url`):
```json
{ "valor": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "clave": "nombre_alcaldia",
    "valor": "Alcaldía Municipal de Pasto — Nariño",
    "tipo": "texto",
    "updatedAt": "2026-08-02T19:30:00Z"
  },
  "message": "Parámetro actualizado correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

**Efectos:** Registra `editar` en `auditoria` con `datos_anteriores` y `datos_nuevos`.

---

### `GET /api/v1/public/configuracion/publica` 🌐

Retorna únicamente los parámetros necesarios para el portal público (nombre, color, municipio). Sin datos sensibles.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "nombreAlcaldia": "Alcaldía Municipal de Pasto",
    "municipio": "Pasto",
    "colorInstitucional": "#1a56db",
    "logoUrl": "https://api.dominio.gov.co/api/v1/public/assets/logo"
  },
  "message": "Configuración pública obtenida correctamente",
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

## 19. Módulo HEALTH — Estado del Sistema

---

### `GET /api/v1/health` 🌐

Verifica la disponibilidad de todos los servicios críticos. Usado por Docker, balanceadores y monitoreo.

**Response 200 — Todo operativo:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": { "status": "ok", "latencyMs": 5 },
    "redis": { "status": "ok", "latencyMs": 2 },
    "storage": { "status": "ok", "latencyMs": 12 }
  },
  "timestamp": "2026-08-02T19:30:00Z",
  "uptime": 86400
}
```

**Response 503 — Servicio degradado:**
```json
{
  "status": "degraded",
  "version": "1.0.0",
  "services": {
    "database": { "status": "ok", "latencyMs": 5 },
    "redis": { "status": "error", "error": "Connection refused" },
    "storage": { "status": "ok", "latencyMs": 12 }
  },
  "timestamp": "2026-08-02T19:30:00Z"
}
```

---

## 20. Matriz de Endpoints

### Endpoints Públicos (`/public/`)

| Método | Endpoint | Rate Limit | Descripción |
|--------|----------|------------|-------------|
| GET | `/api/v1/health` | 60/min | Health check |
| GET | `/api/v1/public/motivos` | 60/min | Motivos para el formulario |
| GET | `/api/v1/public/configuracion/publica` | 60/min | Config pública |
| POST | `/api/v1/public/solicitudes` | 5/hora | Crear solicitud |
| GET | `/api/v1/public/solicitudes/estado` | 10/min | Consultar estado |
| POST | `/api/v1/public/solicitudes/{id}/documentos` | 20/hora | Adjuntar documentos |
| GET | `/api/v1/public/verificar/{codigoQR}` | 30/min | Validar QR |
| POST | `/api/v1/auth/login` | 5/15min | Login |
| POST | `/api/v1/auth/refresh` | 20/min | Refresh token |
| POST | `/api/v1/auth/recuperar-contrasena` | 3/hora | Recuperar contraseña |
| POST | `/api/v1/auth/restablecer-contrasena` | 5/hora | Restablecer contraseña |

### Endpoints de Funcionario 👮 (JWT + rol `funcionario` o `administrador`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/auth/me` | Perfil propio |
| POST | `/api/v1/auth/logout` | Cerrar sesión |
| POST | `/api/v1/auth/cambiar-contrasena` | Cambiar contraseña |
| GET | `/api/v1/dependencias` | Listar dependencias |
| GET | `/api/v1/ciudadanos` | Listar ciudadanos |
| GET | `/api/v1/ciudadanos/{id}` | Detalle ciudadano |
| GET | `/api/v1/ciudadanos/documento/{num}` | Buscar por documento |
| GET | `/api/v1/motocicletas` | Listar motos |
| GET | `/api/v1/motocicletas/{id}` | Detalle moto |
| GET | `/api/v1/motocicletas/placa/{placa}` | Buscar por placa |
| PUT | `/api/v1/motocicletas/{id}` | Actualizar moto |
| GET | `/api/v1/solicitudes` | Listar solicitudes |
| GET | `/api/v1/solicitudes/{id}` | Detalle solicitud |
| POST | `/api/v1/solicitudes/{id}/aprobar` | Aprobar |
| POST | `/api/v1/solicitudes/{id}/rechazar` | Rechazar |
| POST | `/api/v1/solicitudes/{id}/correccion` | Solicitar corrección |
| GET | `/api/v1/solicitudes/{id}/historial` | Historial estados |
| GET | `/api/v1/solicitudes/{id}/documentos` | Listar documentos |
| GET | `/api/v1/solicitudes/{id}/documentos/{docId}` | URL firmada documento |
| GET | `/api/v1/permisos` | Listar permisos |
| GET | `/api/v1/permisos/{id}` | Detalle permiso |
| GET | `/api/v1/permisos/{id}/pdf` | URL firmada PDF |
| GET | `/api/v1/dashboard` | Dashboard del funcionario |

### Endpoints de Administrador 🛡️ (JWT + rol `administrador`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/usuarios` | Listar usuarios |
| GET | `/api/v1/usuarios/{id}` | Detalle usuario |
| POST | `/api/v1/usuarios` | Crear usuario |
| PUT | `/api/v1/usuarios/{id}` | Actualizar usuario |
| PATCH | `/api/v1/usuarios/{id}/activar` | Activar/desactivar usuario |
| DELETE | `/api/v1/usuarios/{id}` | Eliminar usuario (soft) |
| GET | `/api/v1/roles` | Listar roles |
| GET | `/api/v1/roles/{id}` | Detalle rol |
| POST | `/api/v1/roles` | Crear rol |
| PUT | `/api/v1/roles/{id}` | Actualizar rol |
| POST | `/api/v1/dependencias` | Crear dependencia |
| PUT | `/api/v1/dependencias/{id}` | Actualizar dependencia |
| PATCH | `/api/v1/dependencias/{id}/activar` | Activar/desactivar dependencia |
| GET | `/api/v1/motivos` | Listar todos los motivos |
| POST | `/api/v1/motivos` | Crear motivo |
| PUT | `/api/v1/motivos/{id}` | Actualizar motivo |
| PATCH | `/api/v1/motivos/{id}/activar` | Activar/desactivar motivo |
| POST | `/api/v1/permisos/{id}/revocar` | Revocar permiso |
| GET | `/api/v1/dashboard/admin` | Dashboard administrativo |
| GET | `/api/v1/reportes/solicitudes` | Reporte de solicitudes |
| GET | `/api/v1/reportes/permisos-vigentes` | Reporte permisos vigentes |
| GET | `/api/v1/reportes/permisos-vencidos` | Reporte permisos vencidos |
| GET | `/api/v1/reportes/motivos` | Reporte de motivos |
| GET | `/api/v1/reportes/funcionarios` | Reporte de funcionarios |
| POST | `/api/v1/reportes/exportar` | Exportar reporte |
| GET | `/api/v1/auditoria` | Listar bitácora |
| GET | `/api/v1/configuracion` | Ver configuración |
| PUT | `/api/v1/configuracion/{clave}` | Actualizar parámetro |

**Total de endpoints: 56**

---

## 21. Guía de Implementación Swagger

### Configuración en NestJS (`main.ts`)

```typescript
const config = new DocumentBuilder()
  .setTitle('API Sistema Permisos Pico y Placa')
  .setDescription('Sistema de gestión de permisos de circulación de motocicletas para Alcaldía')
  .setVersion('1.0')
  .setContact('Alcaldía Municipal', 'https://alcaldia.gov.co', 'sistemas@alcaldia.gov.co')
  .setLicense('Uso Institucional', '')
  .addServer('https://api.dominio.gov.co', 'Producción')
  .addServer('https://api-staging.dominio.gov.co', 'Staging')
  .addServer('http://localhost:3001', 'Desarrollo local')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' },
    'JWT-Auth'
  )
  .addTag('Auth', 'Autenticación y gestión de sesión')
  .addTag('Usuarios', 'Gestión de usuarios del sistema')
  .addTag('Roles', 'Roles del sistema')
  .addTag('Dependencias', 'Dependencias de la alcaldía')
  .addTag('Motivos', 'Motivos de solicitud configurables')
  .addTag('Ciudadanos', 'Consulta de ciudadanos')
  .addTag('Motocicletas', 'Consulta de motocicletas')
  .addTag('Solicitudes', 'Flujo completo de solicitudes')
  .addTag('Permisos', 'Permisos generados y validación QR')
  .addTag('Dashboard', 'Indicadores y KPIs')
  .addTag('Reportes', 'Reportes y exportaciones')
  .addTag('Auditoria', 'Bitácora de acciones')
  .addTag('Configuracion', 'Parámetros del sistema')
  .addTag('Health', 'Estado del sistema')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
});
```

### Decoradores por Tipo de Endpoint

```typescript
// Endpoint público
@ApiOperation({ summary: 'Crear solicitud de permiso' })
@ApiBody({ type: CrearSolicitudDto })
@ApiResponse({ status: 201, description: 'Solicitud creada', type: SolicitudResponseDto })
@ApiResponse({ status: 400, description: 'Datos inválidos' })
@ApiResponse({ status: 409, description: 'Solicitud ya activa para esta moto' })
@ApiResponse({ status: 429, description: 'Límite de solicitudes excedido' })

// Endpoint protegido con JWT
@ApiBearerAuth('JWT-Auth')
@ApiOperation({ summary: 'Aprobar solicitud' })
@ApiParam({ name: 'id', description: 'UUID de la solicitud', type: 'string', format: 'uuid' })
@ApiResponse({ status: 202, description: 'Solicitud aprobada, permiso en generación' })
@ApiResponse({ status: 401, description: 'No autenticado' })
@ApiResponse({ status: 403, description: 'Sin permiso' })
@ApiResponse({ status: 422, description: 'Estado inválido de la solicitud' })
```

### Convenciones de Documentación

| Elemento | Convención |
|----------|------------|
| `summary` | Acción en infinitivo: "Crear solicitud", "Aprobar solicitud" |
| `description` | Explicación de lógica de negocio aplicada |
| `tags` | Un tag por módulo; cada controller usa `@ApiTags('Modulo')` |
| Seguridad | `@ApiBearerAuth('JWT-Auth')` en todos los endpoints protegidos |
| Modelos | DTOs documentados con `@ApiProperty()` en cada campo |
| Enumeraciones | `@ApiProperty({ enum: EstadoSolicitud })` para campos ENUM |
| Campos opcionales | `@ApiPropertyOptional()` para campos no requeridos |
| Ejemplos | `@ApiBody({ examples: { ... } })` para endpoints complejos |

---

*Documento de referencia permanente. Toda adición o modificación de endpoints debe reflejarse aquí, en `API.md` y en la implementación Swagger del backend antes de considerarse completa.*

*Próxima acción: Implementar los módulos en el orden definido en `ROADMAP.md` comenzando por la Fase 0.*
