-- ============================================================
-- Sistema de Permisos de Circulación (Pico y Placa)
-- Alcaldía — Colombia
-- ============================================================
-- Archivo   : database/schema.sql
-- Motor     : PostgreSQL 15+
-- Fuente    : docs/MODELO_DATOS.md v1.0
-- Rama      : feature/fase-1-base-datos
-- ============================================================
-- ADVERTENCIA: Este script asume un esquema vacío.
-- Si los tipos, tablas o secuencias ya existen, fallará.
-- No usar IF NOT EXISTS. Ver .claude/DATABASE.md
-- § Regla de consistencia del modelo.
-- ============================================================


-- ============================================================
-- SECCIÓN 1: TIPOS ENUM NATIVOS DE POSTGRESQL
-- ============================================================
-- Ref: docs/MODELO_DATOS.md §3
-- ============================================================

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


-- ============================================================
-- SECCIÓN 2: SECUENCIAS
-- ============================================================
-- Ref: docs/MODELO_DATOS.md §11
-- ============================================================

-- Consecutivo global para codigo_permiso.
-- Construcción en aplicación:
--   EXTRACT(YEAR FROM NOW()) || '-PYP-' || LPAD(nextval('seq_codigo_permiso')::text, 5, '0')
CREATE SEQUENCE seq_codigo_permiso
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  NO CYCLE;


-- ============================================================
-- SECCIÓN 3: TABLAS
-- ============================================================
-- Ref: docs/MODELO_DATOS.md §4 – §9
--
-- Orden de creación resuelve dependencias circulares:
--   roles → municipios → dependencias* → usuarios* →
--   tokens → ciudadanos → motocicletas → motivos →
--   solicitudes → historial_estados → documentos →
--   permisos → qr_validaciones → notificaciones →
--   auditoria → configuracion
--
-- * dependencias y usuarios se referencian mutuamente.
--   Las FK circulares se agregan en SECCIÓN 4 con ALTER TABLE.
--   Afectadas:
--     dependencias.created_by  → usuarios
--     dependencias.updated_by  → usuarios
--     usuarios.dependencia_id  → dependencias
--     usuarios.created_by      → usuarios (auto-ref)
--     usuarios.updated_by      → usuarios (auto-ref)
-- ============================================================


-- ------------------------------------------------------------
-- 3.1  roles
-- Ref: MODELO_DATOS.md §4.1
-- ------------------------------------------------------------
CREATE TABLE roles (
  id          UUID         NOT NULL DEFAULT gen_random_uuid(),
  nombre      VARCHAR(50)  NOT NULL,
  descripcion TEXT,
  activo      BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ,

  CONSTRAINT pk_roles        PRIMARY KEY (id),
  CONSTRAINT uq_roles_nombre UNIQUE      (nombre)
);


-- ------------------------------------------------------------
-- 3.2  municipios
-- Ref: MODELO_DATOS.md §4.2
-- ------------------------------------------------------------
CREATE TABLE municipios (
  id           UUID         NOT NULL DEFAULT gen_random_uuid(),
  nombre       VARCHAR(100) NOT NULL,
  departamento VARCHAR(100) NOT NULL,
  codigo_dane  VARCHAR(10)  NOT NULL,
  activo       BOOLEAN      NOT NULL DEFAULT true,

  CONSTRAINT pk_municipios             PRIMARY KEY (id),
  CONSTRAINT uq_municipios_codigo_dane UNIQUE      (codigo_dane)
);


-- ------------------------------------------------------------
-- 3.3  dependencias
-- FK a usuarios omitidas aquí por dependencia circular.
-- Se agregan en SECCIÓN 4.
-- Ref: MODELO_DATOS.md §4.4
-- ------------------------------------------------------------
CREATE TABLE dependencias (
  id          UUID         NOT NULL DEFAULT gen_random_uuid(),
  nombre      VARCHAR(100) NOT NULL,
  codigo      VARCHAR(20)  NOT NULL,
  descripcion TEXT,
  activo      BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ,
  deleted_at  TIMESTAMPTZ,
  created_by  UUID,
  updated_by  UUID,

  CONSTRAINT pk_dependencias        PRIMARY KEY (id),
  CONSTRAINT uq_dependencias_codigo UNIQUE      (codigo)
);


-- ------------------------------------------------------------
-- 3.4  usuarios
-- FK a dependencias y auto-referencias omitidas aquí.
-- Se agregan en SECCIÓN 4.
-- Ref: MODELO_DATOS.md §5.1
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id                    UUID         NOT NULL DEFAULT gen_random_uuid(),
  nombre                VARCHAR(100) NOT NULL,
  apellido              VARCHAR(100) NOT NULL,
  email                 VARCHAR(150) NOT NULL,
  contrasena_hash       VARCHAR(255) NOT NULL,
  rol_id                UUID         NOT NULL,
  dependencia_id        UUID,
  activo                BOOLEAN      NOT NULL DEFAULT true,
  ultimo_login          TIMESTAMPTZ,
  intentos_fallidos     INTEGER      NOT NULL DEFAULT 0,
  bloqueado_hasta       TIMESTAMPTZ,
  contrasena_expira_at  DATE,
  -- Array JSONB con los últimos 5 hashes BCrypt usados.
  -- Impide reutilización de contraseñas. Ver SECURITY.md.
  historial_contrasenas JSONB        NOT NULL DEFAULT '[]',
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ,
  deleted_at            TIMESTAMPTZ,
  created_by            UUID,
  updated_by            UUID,

  CONSTRAINT pk_usuarios       PRIMARY KEY (id),
  CONSTRAINT uq_usuarios_email UNIQUE      (email),
  CONSTRAINT fk_usuarios_rol   FOREIGN KEY (rol_id)
    REFERENCES roles (id) ON DELETE RESTRICT,
  CONSTRAINT chk_usuarios_intentos_fallidos
    CHECK (intentos_fallidos >= 0),
  CONSTRAINT chk_usuarios_email
    CHECK (LENGTH(email) > 5 AND email LIKE '%@%.%')
);


-- ------------------------------------------------------------
-- 3.5  tokens
-- Ref: MODELO_DATOS.md §5.2
-- ------------------------------------------------------------
CREATE TABLE tokens (
  id          UUID         NOT NULL DEFAULT gen_random_uuid(),
  usuario_id  UUID         NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  tipo        VARCHAR(20)  NOT NULL,
  expira_at   TIMESTAMPTZ  NOT NULL,
  revocado    BOOLEAN      NOT NULL DEFAULT false,
  revocado_at TIMESTAMPTZ,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_tokens         PRIMARY KEY (id),
  CONSTRAINT fk_tokens_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE RESTRICT
);


-- ------------------------------------------------------------
-- 3.6  ciudadanos
-- Ref: MODELO_DATOS.md §6.1
-- ------------------------------------------------------------
CREATE TABLE ciudadanos (
  id                       UUID         NOT NULL DEFAULT gen_random_uuid(),
  tipo_documento           VARCHAR(20)  NOT NULL,
  numero_documento         VARCHAR(20)  NOT NULL,
  nombre                   VARCHAR(100) NOT NULL,
  apellido                 VARCHAR(100) NOT NULL,
  fecha_nacimiento         DATE,
  direccion                VARCHAR(200),
  barrio                   VARCHAR(100),
  municipio_id             UUID,
  celular                  VARCHAR(20),
  email                    VARCHAR(150),
  acepta_tratamiento_datos BOOLEAN      NOT NULL DEFAULT false,
  fecha_aceptacion_datos   TIMESTAMPTZ,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ,
  deleted_at               TIMESTAMPTZ,

  CONSTRAINT pk_ciudadanos                  PRIMARY KEY (id),
  CONSTRAINT uq_ciudadanos_numero_documento UNIQUE      (numero_documento),
  CONSTRAINT fk_ciudadanos_municipio        FOREIGN KEY (municipio_id)
    REFERENCES municipios (id) ON DELETE RESTRICT,
  -- Ley 1581/2012: si acepta_tratamiento_datos = true,
  -- la fecha de aceptación debe registrarse.
  CONSTRAINT chk_ciudadanos_tratamiento_datos CHECK (
    (acepta_tratamiento_datos = true AND fecha_aceptacion_datos IS NOT NULL)
    OR acepta_tratamiento_datos = false
  )
);


-- ------------------------------------------------------------
-- 3.7  motocicletas
-- Ref: MODELO_DATOS.md §6.2
-- ------------------------------------------------------------
CREATE TABLE motocicletas (
  id            UUID         NOT NULL DEFAULT gen_random_uuid(),
  ciudadano_id  UUID         NOT NULL,
  placa         VARCHAR(10)  NOT NULL,
  marca         VARCHAR(50),
  linea         VARCHAR(50),
  modelo        INTEGER,
  cilindraje    INTEGER,
  color         VARCHAR(50),
  numero_motor  VARCHAR(50),
  numero_chasis VARCHAR(50),
  activo        BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ,

  CONSTRAINT pk_motocicletas          PRIMARY KEY (id),
  CONSTRAINT fk_motocicletas_ciudadano FOREIGN KEY (ciudadano_id)
    REFERENCES ciudadanos (id) ON DELETE RESTRICT,
  CONSTRAINT chk_motocicletas_modelo
    CHECK (modelo IS NULL OR (modelo >= 1900 AND modelo <= 2100)),
  CONSTRAINT chk_motocicletas_cilindraje
    CHECK (cilindraje IS NULL OR cilindraje > 0)
);


-- ------------------------------------------------------------
-- 3.8  motivos
-- Ref: MODELO_DATOS.md §4.3
-- ------------------------------------------------------------
CREATE TABLE motivos (
  id               UUID         NOT NULL DEFAULT gen_random_uuid(),
  nombre           VARCHAR(100) NOT NULL,
  descripcion      TEXT,
  requiere_soporte BOOLEAN      NOT NULL DEFAULT false,
  activo           BOOLEAN      NOT NULL DEFAULT true,
  orden            INTEGER      NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ,
  created_by       UUID,
  updated_by       UUID,

  CONSTRAINT pk_motivos        PRIMARY KEY (id),
  CONSTRAINT uq_motivos_nombre UNIQUE      (nombre),
  CONSTRAINT fk_motivos_created_by FOREIGN KEY (created_by)
    REFERENCES usuarios (id) ON DELETE RESTRICT,
  CONSTRAINT fk_motivos_updated_by FOREIGN KEY (updated_by)
    REFERENCES usuarios (id) ON DELETE RESTRICT
);


-- ------------------------------------------------------------
-- 3.9  solicitudes
-- Ref: MODELO_DATOS.md §6.3
-- ------------------------------------------------------------
CREATE TABLE solicitudes (
  id                    UUID             NOT NULL DEFAULT gen_random_uuid(),
  numero_radicado       VARCHAR(25)      NOT NULL,
  ciudadano_id          UUID             NOT NULL,
  motocicleta_id        UUID             NOT NULL,
  motivo_id             UUID             NOT NULL,
  fecha_inicio          DATE             NOT NULL,
  fecha_fin             DATE             NOT NULL,
  descripcion_adicional TEXT,
  estado                estado_solicitud NOT NULL DEFAULT 'recibida',
  declaracion_jurada    BOOLEAN          NOT NULL DEFAULT false,
  ip_solicitante        INET,
  recaptcha_score       NUMERIC(3, 2),
  created_at            TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ,
  deleted_at            TIMESTAMPTZ,

  CONSTRAINT pk_solicitudes               PRIMARY KEY (id),
  CONSTRAINT uq_solicitudes_radicado      UNIQUE      (numero_radicado),
  CONSTRAINT fk_solicitudes_ciudadano     FOREIGN KEY (ciudadano_id)
    REFERENCES ciudadanos (id) ON DELETE RESTRICT,
  CONSTRAINT fk_solicitudes_motocicleta   FOREIGN KEY (motocicleta_id)
    REFERENCES motocicletas (id) ON DELETE RESTRICT,
  CONSTRAINT fk_solicitudes_motivo        FOREIGN KEY (motivo_id)
    REFERENCES motivos (id) ON DELETE RESTRICT,
  CONSTRAINT chk_solicitudes_fechas
    CHECK (fecha_fin >= fecha_inicio),
  -- La declaración jurada debe ser true al insertar.
  -- El DEFAULT false existe para compatibilidad con el ORM;
  -- este CHECK garantiza que ningún registro se persista sin aceptación.
  CONSTRAINT chk_solicitudes_declaracion
    CHECK (declaracion_jurada = true)
);


-- ------------------------------------------------------------
-- 3.10 historial_estados
-- Tabla de solo inserción. No modificar ni eliminar registros.
-- Ref: MODELO_DATOS.md §6.4
-- ------------------------------------------------------------
CREATE TABLE historial_estados (
  id                UUID             NOT NULL DEFAULT gen_random_uuid(),
  solicitud_id      UUID             NOT NULL,
  estado_anterior   estado_solicitud,
  estado_nuevo      estado_solicitud NOT NULL,
  motivo            TEXT,
  campos_correccion JSONB,
  usuario_id        UUID,
  ip_address        INET,
  created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_historial_estados    PRIMARY KEY (id),
  CONSTRAINT fk_historial_solicitud  FOREIGN KEY (solicitud_id)
    REFERENCES solicitudes (id) ON DELETE RESTRICT,
  CONSTRAINT fk_historial_usuario    FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE RESTRICT
);


-- ------------------------------------------------------------
-- 3.11 documentos
-- Ref: MODELO_DATOS.md §6.5
-- ------------------------------------------------------------
CREATE TABLE documentos (
  id                UUID                   NOT NULL DEFAULT gen_random_uuid(),
  solicitud_id      UUID                   NOT NULL,
  tipo_documento    tipo_documento_adjunto NOT NULL,
  nombre_original   VARCHAR(255)           NOT NULL,
  nombre_almacenado VARCHAR(255)           NOT NULL,
  -- Ruta interna en MinIO/S3. Nunca exponer en respuestas de API.
  -- Solo generar URLs firmadas con TTL ≤ 5 min bajo petición autenticada.
  storage_key       VARCHAR(500)           NOT NULL,
  mime_type         VARCHAR(100)           NOT NULL,
  tamano_bytes      INTEGER                NOT NULL,
  hash_sha256       VARCHAR(64)            NOT NULL,
  activo            BOOLEAN                NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ            NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_documentos         PRIMARY KEY (id),
  CONSTRAINT fk_documentos_solicitud FOREIGN KEY (solicitud_id)
    REFERENCES solicitudes (id) ON DELETE RESTRICT,
  CONSTRAINT chk_documentos_tamano
    CHECK (tamano_bytes > 0),
  CONSTRAINT chk_documentos_mime_type
    CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png'))
);


-- ------------------------------------------------------------
-- 3.12 permisos
-- Ref: MODELO_DATOS.md §7.1
-- NOTA INC-001: columna hash_pdf incluida per MODELO_DATOS.md.
-- No está presente en PermisoEntity. Ver informe de inconsistencias.
-- ------------------------------------------------------------
CREATE TABLE permisos (
  id                   UUID           NOT NULL DEFAULT gen_random_uuid(),
  -- Formato: YYYY-PYP-NNNNN. Generado con seq_codigo_permiso.
  codigo_permiso       VARCHAR(20)    NOT NULL,
  solicitud_id         UUID           NOT NULL,
  funcionario_id       UUID           NOT NULL,
  -- Identificador opaco: UUID v4 + SHA-256 con salt. Sin datos personales.
  codigo_qr            VARCHAR(100)   NOT NULL,
  -- Ruta interna en MinIO/S3. Nunca exponer en API.
  storage_key_pdf      VARCHAR(500)   NOT NULL,
  fecha_expedicion     TIMESTAMPTZ    NOT NULL,
  fecha_vencimiento    DATE           NOT NULL,
  estado               estado_permiso NOT NULL DEFAULT 'vigente',
  motivo_revocacion    TEXT,
  revocado_at          TIMESTAMPTZ,
  revocado_por         UUID,
  -- Snapshots inmutables del estado exacto al momento de aprobación.
  snapshot_ciudadano   JSONB          NOT NULL,
  snapshot_motocicleta JSONB          NOT NULL,
  snapshot_motivo      JSONB          NOT NULL,
  -- Hash SHA-256 del PDF para verificación de integridad documental.
  hash_pdf             VARCHAR(64),
  created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ,

  CONSTRAINT pk_permisos               PRIMARY KEY (id),
  CONSTRAINT uq_permisos_codigo        UNIQUE      (codigo_permiso),
  CONSTRAINT uq_permisos_solicitud     UNIQUE      (solicitud_id),
  CONSTRAINT uq_permisos_codigo_qr     UNIQUE      (codigo_qr),
  CONSTRAINT fk_permisos_solicitud     FOREIGN KEY (solicitud_id)
    REFERENCES solicitudes (id) ON DELETE RESTRICT,
  CONSTRAINT fk_permisos_funcionario   FOREIGN KEY (funcionario_id)
    REFERENCES usuarios (id) ON DELETE RESTRICT,
  CONSTRAINT fk_permisos_revocado_por  FOREIGN KEY (revocado_por)
    REFERENCES usuarios (id) ON DELETE RESTRICT,
  CONSTRAINT chk_permisos_fecha_vencimiento
    CHECK (fecha_vencimiento > fecha_expedicion::DATE),
  -- Si el estado es 'revocado', motivo y fecha son obligatorios.
  CONSTRAINT chk_permisos_revocacion CHECK (
    (estado = 'revocado'
      AND motivo_revocacion IS NOT NULL
      AND revocado_at IS NOT NULL)
    OR estado <> 'revocado'
  )
);


-- ------------------------------------------------------------
-- 3.13 qr_validaciones
-- Tabla de solo inserción. Auditoría de escaneos QR en campo.
-- Ref: MODELO_DATOS.md §7.2
-- ------------------------------------------------------------
CREATE TABLE qr_validaciones (
  id         UUID         NOT NULL DEFAULT gen_random_uuid(),
  permiso_id UUID,
  codigo_qr  VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  resultado  VARCHAR(20)  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_qr_validaciones       PRIMARY KEY (id),
  CONSTRAINT fk_qr_validaciones_permiso FOREIGN KEY (permiso_id)
    REFERENCES permisos (id) ON DELETE RESTRICT
);


-- ------------------------------------------------------------
-- 3.14 notificaciones
-- Ref: MODELO_DATOS.md §8.1
-- ------------------------------------------------------------
CREATE TABLE notificaciones (
  id             UUID         NOT NULL DEFAULT gen_random_uuid(),
  destinatario   VARCHAR(150) NOT NULL,
  asunto         VARCHAR(200) NOT NULL,
  tipo           VARCHAR(50)  NOT NULL,
  solicitud_id   UUID,
  permiso_id     UUID,
  estado_envio   VARCHAR(20)  NOT NULL DEFAULT 'pendiente',
  intentos       INTEGER      NOT NULL DEFAULT 0,
  ultimo_intento TIMESTAMPTZ,
  error_detalle  TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ,

  CONSTRAINT pk_notificaciones           PRIMARY KEY (id),
  CONSTRAINT fk_notificaciones_solicitud FOREIGN KEY (solicitud_id)
    REFERENCES solicitudes (id) ON DELETE RESTRICT,
  CONSTRAINT fk_notificaciones_permiso   FOREIGN KEY (permiso_id)
    REFERENCES permisos (id) ON DELETE RESTRICT
);


-- ------------------------------------------------------------
-- 3.15 auditoria
-- Tabla de solo inserción (append-only).
-- Cumplimiento Ley 1712/2014 — retención mínima 5 años.
-- El usuario de aplicación debe tener solo INSERT + SELECT.
-- Ref: MODELO_DATOS.md §9.1
-- ------------------------------------------------------------
CREATE TABLE auditoria (
  id               UUID             NOT NULL DEFAULT gen_random_uuid(),
  usuario_id       UUID,
  accion           accion_auditoria NOT NULL,
  entidad          VARCHAR(50),
  entidad_id       UUID,
  datos_anteriores JSONB,
  datos_nuevos     JSONB,
  ip_address       INET,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_auditoria        PRIMARY KEY (id),
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE RESTRICT
);


-- ------------------------------------------------------------
-- 3.16 configuracion
-- Ref: MODELO_DATOS.md §9.2
-- ------------------------------------------------------------
CREATE TABLE configuracion (
  id          UUID         NOT NULL DEFAULT gen_random_uuid(),
  clave       VARCHAR(100) NOT NULL,
  valor       TEXT,
  tipo        tipo_config  NOT NULL DEFAULT 'texto',
  descripcion TEXT,
  updated_at  TIMESTAMPTZ,
  updated_by  UUID,

  CONSTRAINT pk_configuracion        PRIMARY KEY (id),
  CONSTRAINT uq_configuracion_clave  UNIQUE      (clave),
  CONSTRAINT fk_configuracion_updated FOREIGN KEY (updated_by)
    REFERENCES usuarios (id) ON DELETE RESTRICT
);


-- ============================================================
-- SECCIÓN 4: FK CIRCULARES Y AUTO-REFERENCIAS
-- ============================================================
-- Ref: MODELO_DATOS.md §11
-- ============================================================

-- dependencias.created_by → usuarios
ALTER TABLE dependencias
  ADD CONSTRAINT fk_dependencias_created_by
    FOREIGN KEY (created_by) REFERENCES usuarios (id) ON DELETE RESTRICT;

-- dependencias.updated_by → usuarios
ALTER TABLE dependencias
  ADD CONSTRAINT fk_dependencias_updated_by
    FOREIGN KEY (updated_by) REFERENCES usuarios (id) ON DELETE RESTRICT;

-- usuarios.dependencia_id → dependencias
ALTER TABLE usuarios
  ADD CONSTRAINT fk_usuarios_dependencia
    FOREIGN KEY (dependencia_id) REFERENCES dependencias (id) ON DELETE RESTRICT;

-- usuarios.created_by → usuarios (auto-referencia)
ALTER TABLE usuarios
  ADD CONSTRAINT fk_usuarios_created_by
    FOREIGN KEY (created_by) REFERENCES usuarios (id) ON DELETE RESTRICT;

-- usuarios.updated_by → usuarios (auto-referencia)
ALTER TABLE usuarios
  ADD CONSTRAINT fk_usuarios_updated_by
    FOREIGN KEY (updated_by) REFERENCES usuarios (id) ON DELETE RESTRICT;


-- ============================================================
-- SECCIÓN 5: ÍNDICES DE RENDIMIENTO
-- ============================================================
-- Ref: MODELO_DATOS.md §10
--
-- Los índices sobre columnas con UNIQUE constraint (email,
-- numero_documento, numero_radicado, codigo_permiso,
-- solicitud_id en permisos, codigo_qr) son creados
-- automáticamente por PostgreSQL al definir el constraint.
-- No se duplican aquí.
-- ============================================================

-- ------------------------------------------------------------
-- solicitudes
-- ------------------------------------------------------------
CREATE INDEX idx_solicitudes_estado
  ON solicitudes (estado);

CREATE INDEX idx_solicitudes_created_at
  ON solicitudes (created_at DESC);

CREATE INDEX idx_solicitudes_ciudadano_id
  ON solicitudes (ciudadano_id);

CREATE INDEX idx_solicitudes_motocicleta_id
  ON solicitudes (motocicleta_id);

-- Índice compuesto para validar RN-03: una solicitud activa por moto.
CREATE INDEX idx_solicitudes_estado_moto
  ON solicitudes (motocicleta_id, estado);

-- ------------------------------------------------------------
-- ciudadanos
-- ------------------------------------------------------------
CREATE INDEX idx_ciudadanos_email
  ON ciudadanos (email);

-- ------------------------------------------------------------
-- motocicletas
-- ------------------------------------------------------------
CREATE INDEX idx_motocicletas_placa
  ON motocicletas (placa);

CREATE INDEX idx_motocicletas_ciudadano_id
  ON motocicletas (ciudadano_id);

-- ------------------------------------------------------------
-- permisos
-- ------------------------------------------------------------
CREATE INDEX idx_permisos_estado
  ON permisos (estado);

CREATE INDEX idx_permisos_fecha_vencimiento
  ON permisos (fecha_vencimiento);

CREATE INDEX idx_permisos_funcionario_id
  ON permisos (funcionario_id);

-- ------------------------------------------------------------
-- historial_estados
-- ------------------------------------------------------------
CREATE INDEX idx_historial_solicitud_created
  ON historial_estados (solicitud_id, created_at DESC);

-- ------------------------------------------------------------
-- documentos
-- ------------------------------------------------------------
CREATE INDEX idx_documentos_solicitud_id
  ON documentos (solicitud_id);

-- ------------------------------------------------------------
-- tokens
-- NOTA INC-002: MODELO_DATOS.md define idx_tokens_token_hash
-- como índice no-unique. TokenEntity lo define como unique
-- con nombre idx_tokens_hash. schema.sql sigue MODELO_DATOS.md.
-- NOTA INC-003: MODELO_DATOS.md define idx_tokens_usuario_tipo_revocado.
-- TokenEntity usa idx_tokens_usuario_tipo. schema.sql sigue MODELO_DATOS.md.
-- ------------------------------------------------------------
CREATE INDEX idx_tokens_token_hash
  ON tokens (token_hash);

CREATE INDEX idx_tokens_usuario_tipo_revocado
  ON tokens (usuario_id, tipo, revocado);

-- ------------------------------------------------------------
-- usuarios
-- ------------------------------------------------------------
CREATE INDEX idx_usuarios_rol_id
  ON usuarios (rol_id);

-- ------------------------------------------------------------
-- auditoria
-- ------------------------------------------------------------
CREATE INDEX idx_auditoria_created_at
  ON auditoria (created_at DESC);

CREATE INDEX idx_auditoria_usuario_id
  ON auditoria (usuario_id);

CREATE INDEX idx_auditoria_accion
  ON auditoria (accion);

CREATE INDEX idx_auditoria_entidad_id
  ON auditoria (entidad, entidad_id);

-- ------------------------------------------------------------
-- qr_validaciones
-- ------------------------------------------------------------
CREATE INDEX idx_qr_validaciones_permiso_id
  ON qr_validaciones (permiso_id, created_at DESC);

CREATE INDEX idx_qr_validaciones_created_at
  ON qr_validaciones (created_at DESC);

-- ------------------------------------------------------------
-- notificaciones
-- ------------------------------------------------------------
CREATE INDEX idx_notificaciones_estado_envio
  ON notificaciones (estado_envio);

CREATE INDEX idx_notificaciones_solicitud_id
  ON notificaciones (solicitud_id);


-- ============================================================
-- SECCIÓN 6: ÍNDICES PARCIALES
-- ============================================================
-- Ref: MODELO_DATOS.md §10 (índices parciales)
-- ============================================================

-- Solicitudes activas — las más consultadas por funcionarios.
CREATE INDEX idx_solicitudes_activas
  ON solicitudes (estado, created_at DESC)
  WHERE estado IN ('recibida', 'en_revision', 'pendiente_correccion');

-- Permisos vigentes — para el job de vencimiento automático.
CREATE INDEX idx_permisos_vigentes
  ON permisos (fecha_vencimiento)
  WHERE estado = 'vigente';

-- Tokens activos — para validación de sesión sin revisar revocados.
CREATE INDEX idx_tokens_activos
  ON tokens (token_hash, expira_at)
  WHERE revocado = false;

-- Unicidad de placa entre motocicletas no eliminadas (soft delete).
-- Ref: MODELO_DATOS.md §11 — Constraints de unicidad funcional.
-- Este índice partial unique no puede generarse automáticamente
-- por TypeORM y debe mantenerse en esta sección manualmente.
CREATE UNIQUE INDEX uq_motocicletas_placa_activa
  ON motocicletas (placa)
  WHERE deleted_at IS NULL;
