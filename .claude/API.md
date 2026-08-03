# API

## Principios Generales

- Todos los endpoints bajo prefijo `/api/v1/`.
- Rutas públicas (sin autenticación) bajo `/api/v1/public/`.
- Autenticación mediante JWT Bearer Token en cabecera `Authorization`.
- Respuesta estándar en todos los endpoints.
- Paginación obligatoria en todos los listados.
- Documentación completa con Swagger/OpenAPI 3.0.

---

## Estructura de Respuesta Estándar

```json
{
  "success": true,
  "data": { },
  "message": "Operación exitosa",
  "timestamp": "2026-08-02T14:30:00-05:00",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

En caso de error:
```json
{
  "success": false,
  "message": "Descripción del error",
  "code": "ERROR_CODE",
  "timestamp": "2026-08-02T14:30:00-05:00"
}
```

---

## Parámetros de Paginación (Listados)

```
?page=1&limit=20&sortBy=created_at&sortOrder=DESC
```

---

## Roles y Acceso

| Rol | Prefijo de acceso |
|-----|------------------|
| Público | `/api/v1/public/` |
| Funcionario | JWT requerido + rol `funcionario` o `administrador` |
| Administrador | JWT requerido + rol `administrador` |

---

## Módulo: Autenticación

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/login` | Público | Login con email y contraseña |
| POST | `/api/v1/auth/logout` | JWT | Revocar refresh token |
| POST | `/api/v1/auth/refresh` | Público | Renovar access token con refresh token |
| POST | `/api/v1/auth/recuperar-contrasena` | Público | Solicitar token de recuperación por email |
| POST | `/api/v1/auth/restablecer-contrasena` | Público | Restablecer con token de recuperación |
| POST | `/api/v1/auth/cambiar-contrasena` | JWT | Cambiar contraseña estando autenticado |
| GET  | `/api/v1/auth/me` | JWT | Obtener perfil del usuario autenticado |

**Rate Limiting en `/auth/login`:** Máximo 5 intentos por IP en ventana de 15 minutos.

---

## Módulo: Usuarios (Admin)

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/usuarios` | Admin | Listar usuarios con paginación y filtros |
| GET | `/api/v1/usuarios/{id}` | Admin | Obtener usuario por ID |
| POST | `/api/v1/usuarios` | Admin | Crear nuevo usuario funcionario |
| PUT | `/api/v1/usuarios/{id}` | Admin | Actualizar usuario |
| PATCH | `/api/v1/usuarios/{id}/activar` | Admin | Activar/desactivar usuario |
| DELETE | `/api/v1/usuarios/{id}` | Admin | Soft delete de usuario |

**Filtros:** `?rolId=&activo=&dependenciaId=&busqueda=`

---

## Módulo: Roles (Admin)

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/roles` | Admin | Listar roles |
| GET | `/api/v1/roles/{id}` | Admin | Obtener rol por ID |
| POST | `/api/v1/roles` | Admin | Crear rol |
| PUT | `/api/v1/roles/{id}` | Admin | Actualizar rol |

---

## Módulo: Dependencias (Admin)

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/dependencias` | Funcionario | Listar dependencias activas |
| POST | `/api/v1/dependencias` | Admin | Crear dependencia |
| PUT | `/api/v1/dependencias/{id}` | Admin | Actualizar dependencia |
| PATCH | `/api/v1/dependencias/{id}/activar` | Admin | Activar/desactivar |

---

## Módulo: Motivos

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/public/motivos` | Público | Listar motivos activos (para el formulario) |
| GET | `/api/v1/motivos` | Admin | Listar todos los motivos con estado |
| POST | `/api/v1/motivos` | Admin | Crear motivo |
| PUT | `/api/v1/motivos/{id}` | Admin | Actualizar motivo |
| PATCH | `/api/v1/motivos/{id}/activar` | Admin | Activar/desactivar motivo |

---

## Módulo: Ciudadanos

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/ciudadanos` | Funcionario | Listar ciudadanos con paginación |
| GET | `/api/v1/ciudadanos/{id}` | Funcionario | Obtener ciudadano por ID |
| GET | `/api/v1/ciudadanos/documento/{numero}` | Funcionario | Buscar ciudadano por número de documento |

> El ciudadano se crea implícitamente al crear una solicitud. No existe endpoint público de registro de ciudadano separado.

---

## Módulo: Motocicletas

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/motocicletas` | Funcionario | Listar motos con paginación |
| GET | `/api/v1/motocicletas/{id}` | Funcionario | Obtener moto por ID |
| GET | `/api/v1/motocicletas/placa/{placa}` | Funcionario | Buscar moto por placa |
| PUT | `/api/v1/motocicletas/{id}` | Funcionario | Actualizar datos de moto |

> Las motos se crean implícitamente al crear una solicitud.

---

## Módulo: Solicitudes

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| POST | `/api/v1/public/solicitudes` | Público | Crear nueva solicitud (ciudadano) |
| GET | `/api/v1/public/solicitudes/estado` | Público | Consultar estado por radicado + documento |
| GET | `/api/v1/solicitudes` | Funcionario | Listar solicitudes con filtros y paginación |
| GET | `/api/v1/solicitudes/{id}` | Funcionario | Ver detalle completo de una solicitud |
| POST | `/api/v1/solicitudes/{id}/aprobar` | Funcionario | Aprobar solicitud (genera permiso) |
| POST | `/api/v1/solicitudes/{id}/rechazar` | Funcionario | Rechazar con motivo obligatorio |
| POST | `/api/v1/solicitudes/{id}/correccion` | Funcionario | Solicitar corrección con campos específicos |
| GET | `/api/v1/solicitudes/{id}/historial` | Funcionario | Ver historial de cambios de estado |
| POST | `/api/v1/solicitudes/{id}/documentos` | Público | Adjuntar documentos (ciudadano, solo en estado recibida/pendiente_correccion) |
| GET | `/api/v1/solicitudes/{id}/documentos` | Funcionario | Listar documentos de la solicitud |
| GET | `/api/v1/solicitudes/{id}/documentos/{docId}` | Funcionario | URL firmada para descargar documento |

**Filtros en GET `/solicitudes`:**
```
?estado=&fechaInicio=&fechaFin=&documento=&placa=&funcionarioId=&radicado=
```

**Consulta pública de estado:**
```
GET /api/v1/public/solicitudes/estado?radicado=20260802-PYP-001234&documento=12345678
```
Rate limiting: 10 consultas por IP por minuto.

---

## Módulo: Permisos

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/permisos` | Funcionario | Listar permisos con paginación y filtros |
| GET | `/api/v1/permisos/{id}` | Funcionario | Obtener detalle de un permiso |
| GET | `/api/v1/permisos/{id}/pdf` | Funcionario | URL firmada para descargar PDF del permiso |
| POST | `/api/v1/permisos/{id}/revocar` | Admin | Revocar permiso con motivo obligatorio |
| GET | `/api/v1/public/verificar/{codigoQR}` | Público | Validar autenticidad de un permiso por QR |

> Los permisos se generan automáticamente al aprobar una solicitud. No existe un endpoint `POST /permisos` manual.

**Validación pública:**
```
GET /api/v1/public/verificar/a3f9b2c1-... 
```
- Sin autenticación.
- Rate limiting: 30 consultas por IP por minuto.
- Registra en `qr_validaciones`.

**Filtros en GET `/permisos`:**
```
?estado=&fechaInicio=&fechaFin=&placa=&documento=&ciudadanoId=
```

---

## Módulo: Dashboard

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/dashboard` | Funcionario | KPIs del día: recibidas, pendientes, aprobadas, rechazadas, vencidas |
| GET | `/api/v1/dashboard/admin` | Admin | KPIs globales: usuarios activos, tiempos promedio, tasa de aprobación |

---

## Módulo: Reportes (Admin)

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/reportes/solicitudes` | Admin | Listado filtrable de solicitudes |
| GET | `/api/v1/reportes/permisos-vigentes` | Admin | Permisos actualmente vigentes |
| GET | `/api/v1/reportes/permisos-vencidos` | Admin | Permisos vencidos |
| GET | `/api/v1/reportes/motivos` | Admin | Frecuencia de motivos |
| GET | `/api/v1/reportes/funcionarios` | Admin | Actividad por funcionario |
| POST | `/api/v1/reportes/exportar` | Admin | Exportar reporte en formato dado |

**Body de exportación:**
```json
{
  "tipo": "solicitudes",
  "formato": "excel",
  "filtros": {
    "fechaInicio": "2026-01-01",
    "fechaFin": "2026-08-02",
    "estado": "aprobada"
  }
}
```
Formatos: `excel`, `pdf`, `csv`.

---

## Módulo: Auditoría (Admin)

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/auditoria` | Admin | Listar bitácora con filtros y paginación |

**Filtros:**
```
?usuarioId=&accion=&entidad=&fechaInicio=&fechaFin=
```

---

## Módulo: Configuración (Admin)

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/configuracion` | Admin | Obtener todos los parámetros del sistema |
| PUT | `/api/v1/configuracion/{clave}` | Admin | Actualizar un parámetro por clave |
| GET | `/api/v1/public/configuracion/publica` | Público | Parámetros visibles en el portal (nombre alcaldía, color) |

---

## Módulo: Configuración Institucional (Admin)

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/admin/configuracion-institucional` | Admin | Obtener la configuración institucional completa (con URLs firmadas para imágenes) |
| PUT | `/api/v1/admin/configuracion-institucional` | Admin | Actualizar datos textuales institucionales |
| PATCH | `/api/v1/admin/configuracion-institucional/escudo` | Admin | Cargar o reemplazar el escudo oficial (multipart/form-data) |
| PATCH | `/api/v1/admin/configuracion-institucional/logo` | Admin | Cargar, reemplazar o eliminar el logo institucional (multipart/form-data) |
| GET | `/api/v1/public/configuracion-institucional` | Público | Datos públicos de la alcaldía (nombre, URL firmada del escudo) para el portal ciudadano |

> Los endpoints de escritura son exclusivos del rol `administrador`. El endpoint público devuelve solo los campos no sensibles necesarios para el portal. Los `storage_key` de imágenes **nunca** se incluyen en las respuestas — solo URLs firmadas con TTL de 5 minutos.

**Body de actualización de datos textuales (`PUT`):**
```json
{
  "nombreAlcaldia": "Alcaldía Municipal de Neiva",
  "nit": "800.099.999-9",
  "codigoDane": "41001",
  "departamento": "Huila",
  "municipio": "Neiva",
  "direccion": "Calle 10 N° 4-35 Centro Administrativo Municipal",
  "telefono": "6088713000",
  "correoInstitucional": "alcaldia@neiva.gov.co",
  "sitioWeb": "https://www.neiva.gov.co"
}
```

**Respuesta del endpoint público:**
```json
{
  "nombreAlcaldia": "Alcaldía Municipal de Neiva",
  "municipio": "Neiva",
  "departamento": "Huila",
  "correoInstitucional": "alcaldia@neiva.gov.co",
  "escudoUrl": "https://minio.local/institucional/escudo.png?X-Amz-Expires=300&..."
}
```

**Restricciones de imágenes:**
- Formatos: `image/png`, `image/svg+xml`, `image/jpeg`
- Tamaño máximo: 5 MB
- El escudo es **obligatorio** — no puede eliminarse sin reemplazarlo
- El logo es **opcional** — puede eliminarse enviando `DELETE` implícito (`logo: null` en el body)

---

## Módulo: Health

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/v1/health` | Público | Estado del sistema: BD, Redis, storage |

Respuesta:
```json
{
  "status": "ok",
  "database": "ok",
  "redis": "ok",
  "storage": "ok",
  "timestamp": "2026-08-02T14:30:00-05:00"
}
```

---

## Códigos de Error Estándar

| Código HTTP | Código Interno | Significado |
|-------------|----------------|-------------|
| 400 | VALIDATION_ERROR | DTO inválido |
| 401 | UNAUTHORIZED | Sin token o token inválido |
| 403 | FORBIDDEN | Token válido pero sin permiso para esta acción |
| 404 | NOT_FOUND | Recurso no encontrado |
| 409 | CONFLICT | Conflicto de datos (ej: solicitud ya activa para esta moto) |
| 422 | BUSINESS_RULE_ERROR | Violación de regla de negocio |
| 429 | RATE_LIMIT_EXCEEDED | Demasiadas solicitudes |
| 500 | INTERNAL_ERROR | Error interno (sin detalles técnicos en respuesta) |

---

## Notas de Seguridad en la API

- Ningún endpoint público retorna datos sensibles (documentos, hashes, storage keys).
- Los endpoints de descarga de documentos y PDFs retornan URLs firmadas con TTL de 5 minutos, no el archivo directamente.
- El endpoint `/public/verificar/{codigoQR}` nunca retorna datos que no sean los definidos en el PRD para la validación pública.
- Los errores en producción no exponen stack traces ni rutas internas.
- Todo cambio de estado de solicitud o permiso queda registrado en `auditoria` y `historial_estados`.
