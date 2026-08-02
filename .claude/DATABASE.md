# DATABASE

## Motor

PostgreSQL 15+

## ORM

TypeORM con migraciones versionadas.
Nunca usar SQL embebido en servicios; toda interacción a través de Repository.

## Caché / Colas

Redis 7+ (BullMQ para colas, caché para configuración y tokens revocados).

---

## Convenciones Globales

| Convención | Detalle |
|------------|---------|
| Llave primaria | UUID v4 en todas las tablas |
| Soft Delete | Columna `deleted_at TIMESTAMPTZ NULL` |
| Auditoría de fila | `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by` |
| Zona horaria | Todas las fechas en UTC (`TIMESTAMPTZ`). Presentar en COT (UTC-5) en la capa de aplicación |
| Nombres | snake_case en BD; camelCase en TypeScript |
| ENUMs | Usar tipos ENUM nativos de PostgreSQL, no VARCHAR libre |
| Índices | Definir desde la creación; no agregar después como corrección |

---

## Tipos ENUM

```sql
CREATE TYPE estado_solicitud AS ENUM (
  'recibida',
  'en_revision',
  'pendiente_correccion',
  'aprobada',
  'rechazada',
  'vencida'
);

CREATE TYPE estado_permiso AS ENUM (
  'vigente',
  'vencido',
  'revocado'
);

CREATE TYPE tipo_documento_adjunto AS ENUM (
  'cedula',
  'licencia_conduccion',
  'licencia_transito',
  'soat',
  'rtm',
  'carta_laboral',
  'otro'
);

CREATE TYPE tipo_config AS ENUM (
  'texto',
  'numero',
  'booleano',
  'json',
  'imagen_base64'
);

CREATE TYPE accion_auditoria AS ENUM (
  'login',
  'logout',
  'login_fallido',
  'crear',
  'editar',
  'eliminar',
  'aprobar',
  'rechazar',
  'solicitar_correccion',
  'generar_permiso',
  'revocar_permiso',
  'cambiar_contrasena',
  'exportar_reporte'
);
```

---

## Tablas

### `roles`
```
id              UUID PK
nombre          VARCHAR(50) UNIQUE NOT NULL   -- 'administrador', 'funcionario'
descripcion     TEXT
activo          BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ
```

### `dependencias`
```
id              UUID PK
nombre          VARCHAR(100) NOT NULL
codigo          VARCHAR(20) UNIQUE NOT NULL
descripcion     TEXT
activo          BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ
deleted_at      TIMESTAMPTZ
created_by      UUID FK usuarios
updated_by      UUID FK usuarios
```

### `usuarios`
```
id              UUID PK
nombre          VARCHAR(100) NOT NULL
apellido        VARCHAR(100) NOT NULL
email           VARCHAR(150) UNIQUE NOT NULL
contrasena_hash VARCHAR(255) NOT NULL        -- BCrypt rounds 12
rol_id          UUID FK roles NOT NULL
dependencia_id  UUID FK dependencias
activo          BOOLEAN DEFAULT true
ultimo_login    TIMESTAMPTZ
intentos_fallidos INTEGER DEFAULT 0
bloqueado_hasta TIMESTAMPTZ                  -- Bloqueo temporal por intentos fallidos
contrasena_expira_at DATE                    -- Expiración cada 90 días
historial_contrasenas JSONB DEFAULT '[]'     -- Últimas 5 hashes (no reutilizar)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ
deleted_at      TIMESTAMPTZ
created_by      UUID FK usuarios
updated_by      UUID FK usuarios
```

### `tokens`
```
id              UUID PK
usuario_id      UUID FK usuarios NOT NULL
token_hash      VARCHAR(255) NOT NULL         -- Hash del refresh token
tipo            VARCHAR(20) NOT NULL          -- 'refresh', 'reset_contrasena'
expira_at       TIMESTAMPTZ NOT NULL
revocado        BOOLEAN DEFAULT false
revocado_at     TIMESTAMPTZ
ip_address      INET
user_agent      TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```
> Índice: `(token_hash)`, `(usuario_id, tipo, revocado)`

### `municipios`
```
id              UUID PK
nombre          VARCHAR(100) NOT NULL
departamento    VARCHAR(100) NOT NULL
codigo_dane     VARCHAR(10) UNIQUE NOT NULL
activo          BOOLEAN DEFAULT true
```

### `ciudadanos`
```
id              UUID PK
tipo_documento  VARCHAR(20) NOT NULL          -- 'CC', 'CE', 'PAS', 'NIT'
numero_documento VARCHAR(20) UNIQUE NOT NULL
nombre          VARCHAR(100) NOT NULL
apellido        VARCHAR(100) NOT NULL
fecha_nacimiento DATE
direccion       VARCHAR(200)
barrio          VARCHAR(100)
municipio_id    UUID FK municipios
celular         VARCHAR(20)
email           VARCHAR(150)
acepta_tratamiento_datos BOOLEAN NOT NULL DEFAULT false
fecha_aceptacion_datos   TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ
deleted_at      TIMESTAMPTZ
```
> Índice: `(numero_documento)`, `(email)`

### `motocicletas`
```
id              UUID PK
ciudadano_id    UUID FK ciudadanos NOT NULL
placa           VARCHAR(10) NOT NULL
marca           VARCHAR(50)
linea           VARCHAR(50)
modelo          INTEGER                       -- Año modelo
cilindraje      INTEGER
color           VARCHAR(50)
numero_motor    VARCHAR(50)
numero_chasis   VARCHAR(50)
activo          BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ
deleted_at      TIMESTAMPTZ
```
> Índice: `(placa)`, `(ciudadano_id)`
> Constraint: placa formato colombiano validado en aplicación (`AAA000` o `AAA00A`)

### `motivos`
```
id              UUID PK
nombre          VARCHAR(100) UNIQUE NOT NULL
descripcion     TEXT
requiere_soporte BOOLEAN DEFAULT false        -- Si obliga adjuntar carta laboral u otro
activo          BOOLEAN DEFAULT true
orden           INTEGER DEFAULT 0            -- Orden en el desplegable
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ
created_by      UUID FK usuarios
updated_by      UUID FK usuarios
```

### `solicitudes`
```
id              UUID PK
numero_radicado VARCHAR(25) UNIQUE NOT NULL   -- Formato: 20260802-PYP-001234
ciudadano_id    UUID FK ciudadanos NOT NULL
motocicleta_id  UUID FK motocicletas NOT NULL
motivo_id       UUID FK motivos NOT NULL
fecha_inicio    DATE NOT NULL
fecha_fin       DATE NOT NULL
descripcion_adicional TEXT
estado          estado_solicitud NOT NULL DEFAULT 'recibida'
declaracion_jurada BOOLEAN NOT NULL DEFAULT false
ip_solicitante  INET
recaptcha_score NUMERIC(3,2)                 -- Score reCAPTCHA v3
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ
deleted_at      TIMESTAMPTZ
```
> Índice: `(numero_radicado)`, `(ciudadano_id)`, `(estado)`, `(created_at DESC)`, `(motocicleta_id)`

### `historial_estados`
```
id              UUID PK
solicitud_id    UUID FK solicitudes NOT NULL
estado_anterior estado_solicitud
estado_nuevo    estado_solicitud NOT NULL
motivo          TEXT                          -- Obligatorio en rechazos y correcciones
campos_correccion JSONB                       -- Campos específicos a corregir
usuario_id      UUID FK usuarios             -- NULL si fue cambio automático (job)
ip_address      INET
created_at      TIMESTAMPTZ DEFAULT NOW()
```
> Índice: `(solicitud_id, created_at DESC)`

### `documentos`
```
id              UUID PK
solicitud_id    UUID FK solicitudes NOT NULL
tipo_documento  tipo_documento_adjunto NOT NULL
nombre_original VARCHAR(255) NOT NULL
nombre_almacenado VARCHAR(255) NOT NULL
storage_key     VARCHAR(500) NOT NULL         -- Ruta relativa en MinIO/S3
mime_type       VARCHAR(50) NOT NULL
tamano_bytes    INTEGER NOT NULL
hash_sha256     VARCHAR(64) NOT NULL          -- Integridad del archivo
activo          BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT NOW()
```
> Índice: `(solicitud_id)`
> Regla: URLs de descarga son firmadas con expiración. Nunca exponer `storage_key`.

### `permisos`
```
id                    UUID PK
codigo_permiso        VARCHAR(20) UNIQUE NOT NULL  -- Formato: 2026-PYP-00145
solicitud_id          UUID FK solicitudes UNIQUE NOT NULL
funcionario_id        UUID FK usuarios NOT NULL
codigo_qr             VARCHAR(100) UNIQUE NOT NULL  -- UUID+hash, identificador opaco
storage_key_pdf       VARCHAR(500) NOT NULL
fecha_expedicion      TIMESTAMPTZ NOT NULL
fecha_vencimiento     DATE NOT NULL
estado                estado_permiso NOT NULL DEFAULT 'vigente'
motivo_revocacion     TEXT
revocado_at           TIMESTAMPTZ
revocado_por          UUID FK usuarios
snapshot_ciudadano    JSONB NOT NULL               -- Datos al momento de aprobación
snapshot_motocicleta  JSONB NOT NULL               -- Datos al momento de aprobación
snapshot_motivo       JSONB NOT NULL
created_at            TIMESTAMPTZ DEFAULT NOW()
updated_at            TIMESTAMPTZ
```
> Índice: `(codigo_qr)`, `(codigo_permiso)`, `(estado)`, `(fecha_vencimiento)`
> Constraint: `fecha_vencimiento > fecha_expedicion::DATE`

### `qr_validaciones`
```
id              UUID PK
permiso_id      UUID FK permisos              -- NULL si el código no existe
codigo_qr       VARCHAR(100) NOT NULL         -- El código escaneado
ip_address      INET
user_agent      TEXT
resultado       VARCHAR(20) NOT NULL          -- 'vigente','vencido','revocado','no_encontrado'
created_at      TIMESTAMPTZ DEFAULT NOW()
```
> Índice: `(permiso_id, created_at DESC)`, `(created_at DESC)`

### `notificaciones`
```
id              UUID PK
destinatario    VARCHAR(150) NOT NULL         -- Email del ciudadano
asunto          VARCHAR(200) NOT NULL
tipo            VARCHAR(50) NOT NULL          -- 'solicitud_recibida','aprobada','rechazada','correccion'
solicitud_id    UUID FK solicitudes
permiso_id      UUID FK permisos
estado_envio    VARCHAR(20) NOT NULL DEFAULT 'pendiente'  -- 'pendiente','enviado','error'
intentos        INTEGER DEFAULT 0
ultimo_intento  TIMESTAMPTZ
error_detalle   TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ
```
> Índice: `(estado_envio)`, `(solicitud_id)`

### `auditoria`
```
id              UUID PK
usuario_id      UUID FK usuarios              -- NULL si acción pública
accion          accion_auditoria NOT NULL
entidad         VARCHAR(50)                   -- 'solicitud', 'permiso', 'usuario', etc.
entidad_id      UUID
datos_anteriores JSONB
datos_nuevos     JSONB
ip_address      INET
user_agent      TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```
> Índice: `(usuario_id)`, `(accion)`, `(created_at DESC)`, `(entidad, entidad_id)`
> Nota: tabla de solo inserción. Nunca actualizar ni eliminar registros de auditoría.

### `configuracion`
```
id              UUID PK
clave           VARCHAR(100) UNIQUE NOT NULL
valor           TEXT
tipo            tipo_config NOT NULL DEFAULT 'texto'
descripcion     TEXT
updated_at      TIMESTAMPTZ
updated_by      UUID FK usuarios
```

---

## Relaciones (Diagrama Simplificado)

```
roles ──< usuarios >── dependencias
              │
              ├──< auditoria
              ├──< tokens
              └──< permisos (funcionario_id)

ciudadanos ──< motocicletas
     │
     └──< solicitudes >── motivos
               │
               ├──< historial_estados >── usuarios
               ├──< documentos
               └──── permisos >── qr_validaciones
                          │
                          └──< notificaciones

configuracion (tabla independiente de parámetros del sistema)
municipios (catálogo)
```

---

## Índices de Rendimiento

```sql
-- Solicitudes (búsquedas frecuentes del funcionario)
CREATE INDEX idx_solicitudes_estado         ON solicitudes(estado);
CREATE INDEX idx_solicitudes_created_at     ON solicitudes(created_at DESC);
CREATE INDEX idx_solicitudes_ciudadano_id   ON solicitudes(ciudadano_id);
CREATE INDEX idx_solicitudes_motocicleta_id ON solicitudes(motocicleta_id);

-- Ciudadanos
CREATE INDEX idx_ciudadanos_numero_doc      ON ciudadanos(numero_documento);

-- Motocicletas
CREATE INDEX idx_motocicletas_placa         ON motocicletas(placa);

-- Permisos
CREATE INDEX idx_permisos_codigo_qr         ON permisos(codigo_qr);
CREATE INDEX idx_permisos_estado            ON permisos(estado);
CREATE INDEX idx_permisos_fecha_venc        ON permisos(fecha_vencimiento);

-- Auditoría
CREATE INDEX idx_auditoria_created_at       ON auditoria(created_at DESC);
CREATE INDEX idx_auditoria_usuario_id       ON auditoria(usuario_id);

-- Tokens
CREATE INDEX idx_tokens_hash                ON tokens(token_hash);
CREATE INDEX idx_tokens_usuario_tipo        ON tokens(usuario_id, tipo, revocado);
```

---

## Datos Semilla Requeridos (Seeds)

```
roles: administrador, funcionario
configuracion: nombre_alcaldia, municipio, dias_max_permiso=30, plazo_revision_horas=48, plazo_correccion_dias=5
motivos: Trabajo, Emergencia médica, Prestación de servicios, Domicilios, Contratista, Empresa pública, Empresa privada, Fuerza mayor, Otro
municipios: al menos el municipio de la alcaldía
usuario administrador inicial (contraseña temporal)
```

---

## Notas de Seguridad

- Los archivos adjuntos (`storage_key`) nunca se exponen en respuestas de API. Solo se generan URLs firmadas con TTL corto bajo solicitud autenticada.
- La tabla `auditoria` es de solo inserción (append-only). No se permite UPDATE ni DELETE sobre ella.
- Los hashes de contraseña usan BCrypt con 12 rounds mínimo.
- El campo `historial_contrasenas` en `usuarios` almacena los últimos 5 hashes para evitar reutilización.

---

# Regla de Consistencia del Modelo

La definición del modelo de datos seguirá obligatoriamente el siguiente orden de prioridad:

1. `MODELO_DATOS.md`
2. Entidades del ORM oficial (TypeORM)
3. Migraciones
4. `schema.sql`

Ningún artefacto podrá modificar el modelo de datos de forma independiente.

Si durante el desarrollo se detecta una inconsistencia entre estos artefactos, la implementación deberá detenerse y presentar la diferencia al usuario para su aprobación antes de continuar.

No está permitido corregir automáticamente una inconsistencia estructural.
