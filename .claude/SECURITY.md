# SECURITY

## Principio General

La seguridad es transversal a todas las capas del sistema.
Ninguna funcionalidad se considera completa sin haber aplicado los controles de seguridad correspondientes.

---

## Autenticación

### JWT + Refresh Token

| Parámetro | Valor |
|-----------|-------|
| Access Token TTL | 15 minutos |
| Refresh Token TTL | 7 días |
| Algoritmo | HS256 mínimo, RS256 recomendado en producción |
| Almacenamiento Refresh | HttpOnly cookie o tabla `tokens` en BD |
| Rotación | Cada uso del refresh token genera uno nuevo e invalida el anterior |
| Revocación | Lista de tokens revocados en Redis (TTL igual al token) |

### BCrypt

- Rounds mínimos: **12**.
- Nunca almacenar contraseña en texto plano ni en logs.
- Historial de las últimas **5 contraseñas** por usuario para evitar reutilización.

### Política de Contraseñas (Funcionarios y Administradores)

| Regla | Valor |
|-------|-------|
| Longitud mínima | 10 caracteres |
| Mayúscula obligatoria | Sí |
| Minúscula obligatoria | Sí |
| Número obligatorio | Sí |
| Carácter especial obligatorio | Sí (`!@#$%^&*`) |
| Expiración | 90 días |
| Reutilización | Últimas 5 contraseñas no permitidas |
| Bloqueo por intentos fallidos | 5 intentos → bloqueo 30 minutos |

---

## Control de Acceso (RBAC)

### Matriz de Permisos

| Recurso / Acción | Público | Ciudadano* | Funcionario | Administrador |
|------------------|---------|-----------|-------------|---------------|
| Crear solicitud | ✅ | — | — | — |
| Consultar estado por radicado | ✅ | — | — | — |
| Adjuntar documentos propios | ✅ | — | — | — |
| Validar QR | ✅ | — | — | — |
| Ver lista de solicitudes | ❌ | — | ✅ | ✅ |
| Ver detalle de solicitud | ❌ | — | ✅ | ✅ |
| Aprobar / Rechazar solicitud | ❌ | — | ✅ | ✅ |
| Descargar documento adjunto | ❌ | — | ✅ | ✅ |
| Generar / descargar PDF permiso | ❌ | — | ✅ | ✅ |
| Revocar permiso | ❌ | — | ❌ | ✅ |
| CRUD Usuarios | ❌ | — | ❌ | ✅ |
| CRUD Roles | ❌ | — | ❌ | ✅ |
| CRUD Motivos | ❌ | — | ❌ | ✅ |
| Ver auditoría | ❌ | — | ❌ | ✅ |
| Exportar reportes | ❌ | — | ❌ | ✅ |
| Configurar sistema | ❌ | — | ❌ | ✅ |

*El ciudadano no tiene cuenta; se identifica con radicado + documento.

### Implementación en NestJS

```typescript
// Guard de autenticación
@UseGuards(JwtAuthGuard)

// Guard de rol
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')

// Decorator personalizado
@RequiresRole('funcionario', 'administrador')
```

---

## Protección de Endpoints HTTP

### Headers de Seguridad (Helmet)

```typescript
app.use(helmet({
  contentSecurityPolicy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' },
}));
```

### CORS

- Origen permitido: solo el dominio del frontend configurado en `FRONTEND_URL`.
- Métodos: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- Credenciales: habilitadas solo para el dominio propio.

### Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `POST /auth/login` | 5 intentos | 15 minutos por IP |
| `POST /auth/recuperar-contrasena` | 3 intentos | 1 hora por IP |
| `GET /public/verificar/{qr}` | 30 consultas | 1 minuto por IP |
| `GET /public/solicitudes/estado` | 10 consultas | 1 minuto por IP |
| `POST /public/solicitudes` | 5 solicitudes | 1 hora por IP |
| Global (resto de endpoints) | 100 requests | 1 minuto por IP |

### CSRF

- Aplicar protección CSRF en formularios con sesión de cookie.
- Si se usa solo JWT en cabecera `Authorization`, CSRF no aplica para la API REST.
- El formulario público del ciudadano usa reCAPTCHA v3 como capa de protección adicional.

---

## Seguridad en Datos

### Validación de Entrada

- **Todos** los DTOs usan `class-validator` con decoradores estrictos.
- Whitelist habilitado globalmente: `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))`.
- Nunca confiar en datos del cliente para determinar roles, IDs de otros recursos ni estados.

### Prevención de IDOR

- Verificar siempre que el recurso pertenece al solicitante o que el usuario tiene rol suficiente.
- Los funcionarios no pueden acceder a solicitudes de otros municipios/dependencias si aplica restricción.
- Los endpoints públicos (`/public/*`) nunca retornan datos de otros ciudadanos.

### Prevención de SQL Injection

- Uso exclusivo de TypeORM con parámetros nombrados. Nunca concatenar strings en queries.
- Prohibido `query()` con interpolación directa en repositories.

### Prevención de XSS

- Sanitizar todos los campos de texto libre antes de:
  - Renderizar en el PDF.
  - Almacenar en campos que se mostrarán en HTML.
- Usar `DOMPurify` en frontend o equivalente en backend para campos de texto libre.

### Almacenamiento de Archivos

- Los archivos adjuntos (cédulas, licencias, SOAT) son datos sensibles bajo Ley 1581.
- **Nunca** exponer la ruta interna (`storage_key`) en respuestas de API.
- Acceso exclusivo mediante **URLs firmadas** con TTL de 5 minutos.
- Bucket de documentos en MinIO con acceso privado (no público).
- Bucket de PDFs en MinIO con acceso privado; URLs firmadas para descarga.

### Datos Sensibles en Logs

- **Prohibido** loguear: contraseñas, tokens JWT, refresh tokens, datos de tarjetas, número de documento completo.
- Los logs de auditoría en BD pueden contener número de documento (dato necesario para trazabilidad legal).
- Los logs del servidor (Winston/Pino) deben enmascarar campos sensibles.

---

## Auditoría

### Qué se registra

Toda acción que modifica datos o accede a información sensible:

| Acción | Tabla `auditoria` |
|--------|------------------|
| Login exitoso | ✅ |
| Login fallido | ✅ (con IP) |
| Logout | ✅ |
| Crear solicitud | ✅ |
| Cambio de estado (cualquiera) | ✅ |
| Generar permiso | ✅ |
| Revocar permiso | ✅ |
| Descargar documento adjunto | ✅ |
| Descargar PDF permiso | ✅ |
| Crear/editar/eliminar usuario | ✅ |
| Cambiar contraseña | ✅ |
| Modificar configuración | ✅ |
| Exportar reporte | ✅ |

### Qué se almacena por registro

```
usuario_id, accion, entidad, entidad_id,
datos_anteriores (JSONB), datos_nuevos (JSONB),
ip_address, user_agent, created_at
```

### Reglas de la Bitácora

- La tabla `auditoria` es de **solo inserción** (append-only). Ningún proceso puede hacer UPDATE o DELETE sobre ella.
- Retención mínima: **5 años** (documento público según Ley 1712/2014).
- Solo el Administrador puede consultar la bitácora; nunca se expone en endpoints de funcionario.

---

## Marco Legal de Seguridad (Colombia)

| Norma | Impacto en Seguridad |
|-------|---------------------|
| Ley 1581/2012 | Datos personales de ciudadanos requieren consentimiento, propósito definido y protección |
| CONPES 3854/2016 | Lineamientos de ciberseguridad para entidades del Estado |
| Ley 527/1999 | La firma digital del funcionario debe tener validez legal |
| ISO 27001 (referencia) | Buenas prácticas de gestión de seguridad de la información |

### Requisitos Ley 1581 Implementados

- Casilla obligatoria de autorización de tratamiento de datos en el formulario del ciudadano.
- Campo `acepta_tratamiento_datos` + `fecha_aceptacion_datos` en tabla `ciudadanos`.
- Enlace a política de privacidad visible en el formulario.
- Datos mínimos necesarios solicitados (principio de minimización).
- Posibilidad técnica de atender derechos de acceso, rectificación y supresión (gestionado por Administrador).

---

## Seguridad en el PDF y QR

### PDF

- Generado en el servidor, nunca en el cliente.
- Template sin ejecución de JavaScript (evitar inyección).
- Todos los campos del ciudadano sanitizados antes de insertarse en el template.
- Firmado digitalmente (watermark o firma configurable).
- Hash SHA-256 del PDF almacenado para verificar integridad.

### Código QR

- El identificador del QR es un **UUID v4 + hash SHA-256** del ID del permiso concatenado con un salt secreto.
- Nunca contiene datos personales.
- Solo un identificador opaco resuelto por el servidor al escanear.
- Formato de URL: `https://dominio.gov.co/verificar/{codigo_opaco}`.
- La tabla `qr_validaciones` registra cada escaneo (IP, fecha, resultado).

---

## Checklist de Seguridad por Módulo

Antes de considerar un módulo como completo, verificar:

- [ ] DTOs con validación estricta y whitelist.
- [ ] Guards aplicados en controllers (JWT + Roles).
- [ ] Registro en tabla `auditoria` para acciones sensibles.
- [ ] Sin exposición de datos internos en respuestas de error.
- [ ] Rate limiting aplicado en endpoints públicos.
- [ ] URLs firmadas para recursos almacenados (no rutas directas).
- [ ] Tests unitarios para lógica de autorización.
- [ ] Sin SQL embebido ni concatenación de strings en queries.
