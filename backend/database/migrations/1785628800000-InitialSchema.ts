import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración inicial — crea el esquema completo del sistema.
 * Fuente oficial: docs/MODELO_DATOS.md v1.0
 * Equivalente SQL: database/schema.sql
 * Compatible con PostgreSQL 15+.
 */
export class InitialSchema1785628800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ================================================================
    // SECCIÓN 1: TIPOS ENUM NATIVOS DE POSTGRESQL
    // Ref: MODELO_DATOS.md §3
    // ================================================================

    await queryRunner.query(`
      CREATE TYPE estado_solicitud AS ENUM (
        'recibida',
        'en_revision',
        'pendiente_correccion',
        'aprobada',
        'rechazada',
        'vencida'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE estado_permiso AS ENUM (
        'vigente',
        'vencido',
        'revocado'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE tipo_documento_adjunto AS ENUM (
        'cedula',
        'licencia_conduccion',
        'licencia_transito',
        'soat',
        'rtm',
        'carta_laboral',
        'otro'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE tipo_config AS ENUM (
        'texto',
        'numero',
        'booleano',
        'json',
        'imagen_base64'
      )
    `);

    await queryRunner.query(`
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
      )
    `);

    // ================================================================
    // SECCIÓN 2: SECUENCIAS
    // Ref: MODELO_DATOS.md §11
    // ================================================================

    await queryRunner.query(`
      CREATE SEQUENCE seq_codigo_permiso
        START WITH 1
        INCREMENT BY 1
        NO MAXVALUE
        NO CYCLE
    `);

    // ================================================================
    // SECCIÓN 3: TABLAS
    // Ref: MODELO_DATOS.md §4 – §9
    // Orden resuelve FK circulares (usuarios <-> dependencias).
    // Las FK circulares se agregan en SECCIÓN 4.
    // ================================================================

    // ----------------------------------------------------------------
    // 3.1  roles — Ref: §4.1
    // ----------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE roles (
        id          UUID         NOT NULL DEFAULT gen_random_uuid(),
        nombre      VARCHAR(50)  NOT NULL,
        descripcion TEXT,
        activo      BOOLEAN      NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ,

        CONSTRAINT pk_roles        PRIMARY KEY (id),
        CONSTRAINT uq_roles_nombre UNIQUE      (nombre)
      )
    `);

    // ----------------------------------------------------------------
    // 3.2  municipios — Ref: §4.2
    // ----------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE municipios (
        id           UUID         NOT NULL DEFAULT gen_random_uuid(),
        nombre       VARCHAR(100) NOT NULL,
        departamento VARCHAR(100) NOT NULL,
        codigo_dane  VARCHAR(10)  NOT NULL,
        activo       BOOLEAN      NOT NULL DEFAULT true,

        CONSTRAINT pk_municipios             PRIMARY KEY (id),
        CONSTRAINT uq_municipios_codigo_dane UNIQUE      (codigo_dane)
      )
    `);

    // ----------------------------------------------------------------
    // 3.3  dependencias — Ref: §4.4
    // FK a usuarios omitidas (circular). Se agregan en SECCIÓN 4.
    // ----------------------------------------------------------------
    await queryRunner.query(`
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
      )
    `);

    // ----------------------------------------------------------------
    // 3.4  usuarios — Ref: §5.1
    // FK a dependencias y auto-referencias omitidas. Se agregan en SECCIÓN 4.
    // ----------------------------------------------------------------
    await queryRunner.query(`
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
      )
    `);

    // ----------------------------------------------------------------
    // 3.5  tokens — Ref: §5.2
    // ----------------------------------------------------------------
    await queryRunner.query(`
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
      )
    `);

    // ----------------------------------------------------------------
    // 3.6  ciudadanos — Ref: §6.1
    // ----------------------------------------------------------------
    await queryRunner.query(`
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
        CONSTRAINT chk_ciudadanos_tratamiento_datos CHECK (
          (acepta_tratamiento_datos = true AND fecha_aceptacion_datos IS NOT NULL)
          OR acepta_tratamiento_datos = false
        )
      )
    `);

    // ----------------------------------------------------------------
    // 3.7  motocicletas — Ref: §6.2
    // ----------------------------------------------------------------
    await queryRunner.query(`
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

        CONSTRAINT pk_motocicletas           PRIMARY KEY (id),
        CONSTRAINT fk_motocicletas_ciudadano FOREIGN KEY (ciudadano_id)
          REFERENCES ciudadanos (id) ON DELETE RESTRICT,
        CONSTRAINT chk_motocicletas_modelo
          CHECK (modelo IS NULL OR (modelo >= 1900 AND modelo <= 2100)),
        CONSTRAINT chk_motocicletas_cilindraje
          CHECK (cilindraje IS NULL OR cilindraje > 0)
      )
    `);

    // ----------------------------------------------------------------
    // 3.8  motivos — Ref: §4.3
    // ----------------------------------------------------------------
    await queryRunner.query(`
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
      )
    `);

    // ----------------------------------------------------------------
    // 3.9  solicitudes — Ref: §6.3
    // ----------------------------------------------------------------
    await queryRunner.query(`
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

        CONSTRAINT pk_solicitudes             PRIMARY KEY (id),
        CONSTRAINT uq_solicitudes_radicado    UNIQUE      (numero_radicado),
        CONSTRAINT fk_solicitudes_ciudadano   FOREIGN KEY (ciudadano_id)
          REFERENCES ciudadanos (id) ON DELETE RESTRICT,
        CONSTRAINT fk_solicitudes_motocicleta FOREIGN KEY (motocicleta_id)
          REFERENCES motocicletas (id) ON DELETE RESTRICT,
        CONSTRAINT fk_solicitudes_motivo      FOREIGN KEY (motivo_id)
          REFERENCES motivos (id) ON DELETE RESTRICT,
        CONSTRAINT chk_solicitudes_fechas
          CHECK (fecha_fin >= fecha_inicio),
        CONSTRAINT chk_solicitudes_declaracion
          CHECK (declaracion_jurada = true)
      )
    `);

    // ----------------------------------------------------------------
    // 3.10 historial_estados — Ref: §6.4
    // Tabla de solo inserción.
    // ----------------------------------------------------------------
    await queryRunner.query(`
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

        CONSTRAINT pk_historial_estados   PRIMARY KEY (id),
        CONSTRAINT fk_historial_solicitud FOREIGN KEY (solicitud_id)
          REFERENCES solicitudes (id) ON DELETE RESTRICT,
        CONSTRAINT fk_historial_usuario   FOREIGN KEY (usuario_id)
          REFERENCES usuarios (id) ON DELETE RESTRICT
      )
    `);

    // ----------------------------------------------------------------
    // 3.11 documentos — Ref: §6.5
    // ----------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE documentos (
        id                UUID                   NOT NULL DEFAULT gen_random_uuid(),
        solicitud_id      UUID                   NOT NULL,
        tipo_documento    tipo_documento_adjunto NOT NULL,
        nombre_original   VARCHAR(255)           NOT NULL,
        nombre_almacenado VARCHAR(255)           NOT NULL,
        storage_key       VARCHAR(500)           NOT NULL,
        mime_type         VARCHAR(100)           NOT NULL,
        tamano_bytes      INTEGER                NOT NULL,
        hash_sha256       VARCHAR(64)            NOT NULL,
        activo            BOOLEAN                NOT NULL DEFAULT true,
        created_at        TIMESTAMPTZ            NOT NULL DEFAULT NOW(),

        CONSTRAINT pk_documentos          PRIMARY KEY (id),
        CONSTRAINT fk_documentos_solicitud FOREIGN KEY (solicitud_id)
          REFERENCES solicitudes (id) ON DELETE RESTRICT,
        CONSTRAINT chk_documentos_tamano
          CHECK (tamano_bytes > 0),
        CONSTRAINT chk_documentos_mime_type
          CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png'))
      )
    `);

    // ----------------------------------------------------------------
    // 3.12 permisos — Ref: §7.1
    // ----------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE permisos (
        id                   UUID           NOT NULL DEFAULT gen_random_uuid(),
        codigo_permiso       VARCHAR(20)    NOT NULL,
        solicitud_id         UUID           NOT NULL,
        funcionario_id       UUID           NOT NULL,
        codigo_qr            VARCHAR(100)   NOT NULL,
        storage_key_pdf      VARCHAR(500)   NOT NULL,
        fecha_expedicion     TIMESTAMPTZ    NOT NULL,
        fecha_vencimiento    DATE           NOT NULL,
        estado               estado_permiso NOT NULL DEFAULT 'vigente',
        motivo_revocacion    TEXT,
        revocado_at          TIMESTAMPTZ,
        revocado_por         UUID,
        snapshot_ciudadano   JSONB          NOT NULL,
        snapshot_motocicleta JSONB          NOT NULL,
        snapshot_motivo      JSONB          NOT NULL,
        hash_pdf             VARCHAR(64),
        created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
        updated_at           TIMESTAMPTZ,

        CONSTRAINT pk_permisos              PRIMARY KEY (id),
        CONSTRAINT uq_permisos_codigo       UNIQUE      (codigo_permiso),
        CONSTRAINT uq_permisos_solicitud    UNIQUE      (solicitud_id),
        CONSTRAINT uq_permisos_codigo_qr    UNIQUE      (codigo_qr),
        CONSTRAINT fk_permisos_solicitud    FOREIGN KEY (solicitud_id)
          REFERENCES solicitudes (id) ON DELETE RESTRICT,
        CONSTRAINT fk_permisos_funcionario  FOREIGN KEY (funcionario_id)
          REFERENCES usuarios (id) ON DELETE RESTRICT,
        CONSTRAINT fk_permisos_revocado_por FOREIGN KEY (revocado_por)
          REFERENCES usuarios (id) ON DELETE RESTRICT,
        CONSTRAINT chk_permisos_fecha_vencimiento
          CHECK (fecha_vencimiento > fecha_expedicion::DATE),
        CONSTRAINT chk_permisos_revocacion CHECK (
          (estado = 'revocado'
            AND motivo_revocacion IS NOT NULL
            AND revocado_at IS NOT NULL)
          OR estado <> 'revocado'
        )
      )
    `);

    // ----------------------------------------------------------------
    // 3.13 qr_validaciones — Ref: §7.2
    // Tabla de solo inserción.
    // ----------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE qr_validaciones (
        id         UUID         NOT NULL DEFAULT gen_random_uuid(),
        permiso_id UUID,
        codigo_qr  VARCHAR(100) NOT NULL,
        ip_address INET,
        user_agent TEXT,
        resultado  VARCHAR(20)  NOT NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

        CONSTRAINT pk_qr_validaciones        PRIMARY KEY (id),
        CONSTRAINT fk_qr_validaciones_permiso FOREIGN KEY (permiso_id)
          REFERENCES permisos (id) ON DELETE RESTRICT
      )
    `);

    // ----------------------------------------------------------------
    // 3.14 notificaciones — Ref: §8.1
    // ----------------------------------------------------------------
    await queryRunner.query(`
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
      )
    `);

    // ----------------------------------------------------------------
    // 3.15 auditoria — Ref: §9.1
    // Tabla de solo inserción. Ley 1712/2014 — retención mínima 5 años.
    // ----------------------------------------------------------------
    await queryRunner.query(`
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

        CONSTRAINT pk_auditoria         PRIMARY KEY (id),
        CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id)
          REFERENCES usuarios (id) ON DELETE RESTRICT
      )
    `);

    // ----------------------------------------------------------------
    // 3.16 configuracion — Ref: §9.2
    // ----------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE configuracion (
        id          UUID         NOT NULL DEFAULT gen_random_uuid(),
        clave       VARCHAR(100) NOT NULL,
        valor       TEXT,
        tipo        tipo_config  NOT NULL DEFAULT 'texto',
        descripcion TEXT,
        updated_at  TIMESTAMPTZ,
        updated_by  UUID,

        CONSTRAINT pk_configuracion         PRIMARY KEY (id),
        CONSTRAINT uq_configuracion_clave   UNIQUE      (clave),
        CONSTRAINT fk_configuracion_updated FOREIGN KEY (updated_by)
          REFERENCES usuarios (id) ON DELETE RESTRICT
      )
    `);

    // ================================================================
    // SECCIÓN 4: FK CIRCULARES Y AUTO-REFERENCIAS
    // Ref: MODELO_DATOS.md §11
    // ================================================================

    await queryRunner.query(`
      ALTER TABLE dependencias
        ADD CONSTRAINT fk_dependencias_created_by
          FOREIGN KEY (created_by) REFERENCES usuarios (id) ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE dependencias
        ADD CONSTRAINT fk_dependencias_updated_by
          FOREIGN KEY (updated_by) REFERENCES usuarios (id) ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE usuarios
        ADD CONSTRAINT fk_usuarios_dependencia
          FOREIGN KEY (dependencia_id) REFERENCES dependencias (id) ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE usuarios
        ADD CONSTRAINT fk_usuarios_created_by
          FOREIGN KEY (created_by) REFERENCES usuarios (id) ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE usuarios
        ADD CONSTRAINT fk_usuarios_updated_by
          FOREIGN KEY (updated_by) REFERENCES usuarios (id) ON DELETE RESTRICT
    `);

    // ================================================================
    // SECCIÓN 5: ÍNDICES DE RENDIMIENTO
    // Ref: MODELO_DATOS.md §10
    // Los índices sobre columnas con UNIQUE constraint son creados
    // automáticamente por PostgreSQL al definir el constraint.
    // ================================================================

    // solicitudes
    await queryRunner.query(`CREATE INDEX idx_solicitudes_estado ON solicitudes (estado)`);
    await queryRunner.query(`CREATE INDEX idx_solicitudes_created_at ON solicitudes (created_at DESC)`);
    await queryRunner.query(`CREATE INDEX idx_solicitudes_ciudadano_id ON solicitudes (ciudadano_id)`);
    await queryRunner.query(`CREATE INDEX idx_solicitudes_motocicleta_id ON solicitudes (motocicleta_id)`);
    await queryRunner.query(`CREATE INDEX idx_solicitudes_estado_moto ON solicitudes (motocicleta_id, estado)`);

    // ciudadanos
    await queryRunner.query(`CREATE INDEX idx_ciudadanos_email ON ciudadanos (email)`);

    // motocicletas
    await queryRunner.query(`CREATE INDEX idx_motocicletas_placa ON motocicletas (placa)`);
    await queryRunner.query(`CREATE INDEX idx_motocicletas_ciudadano_id ON motocicletas (ciudadano_id)`);

    // permisos
    await queryRunner.query(`CREATE INDEX idx_permisos_estado ON permisos (estado)`);
    await queryRunner.query(`CREATE INDEX idx_permisos_fecha_vencimiento ON permisos (fecha_vencimiento)`);
    await queryRunner.query(`CREATE INDEX idx_permisos_funcionario_id ON permisos (funcionario_id)`);

    // historial_estados
    await queryRunner.query(`CREATE INDEX idx_historial_solicitud_created ON historial_estados (solicitud_id, created_at DESC)`);

    // documentos
    await queryRunner.query(`CREATE INDEX idx_documentos_solicitud_id ON documentos (solicitud_id)`);

    // tokens
    await queryRunner.query(`CREATE INDEX idx_tokens_token_hash ON tokens (token_hash)`);
    await queryRunner.query(`CREATE INDEX idx_tokens_usuario_tipo_revocado ON tokens (usuario_id, tipo, revocado)`);

    // usuarios
    await queryRunner.query(`CREATE INDEX idx_usuarios_rol_id ON usuarios (rol_id)`);

    // auditoria
    await queryRunner.query(`CREATE INDEX idx_auditoria_created_at ON auditoria (created_at DESC)`);
    await queryRunner.query(`CREATE INDEX idx_auditoria_usuario_id ON auditoria (usuario_id)`);
    await queryRunner.query(`CREATE INDEX idx_auditoria_accion ON auditoria (accion)`);
    await queryRunner.query(`CREATE INDEX idx_auditoria_entidad_id ON auditoria (entidad, entidad_id)`);

    // qr_validaciones
    await queryRunner.query(`CREATE INDEX idx_qr_validaciones_permiso_id ON qr_validaciones (permiso_id, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX idx_qr_validaciones_created_at ON qr_validaciones (created_at DESC)`);

    // notificaciones
    await queryRunner.query(`CREATE INDEX idx_notificaciones_estado_envio ON notificaciones (estado_envio)`);
    await queryRunner.query(`CREATE INDEX idx_notificaciones_solicitud_id ON notificaciones (solicitud_id)`);

    // ================================================================
    // SECCIÓN 6: ÍNDICES PARCIALES
    // Ref: MODELO_DATOS.md §10 (índices parciales)
    // ================================================================

    await queryRunner.query(`
      CREATE INDEX idx_solicitudes_activas
        ON solicitudes (estado, created_at DESC)
        WHERE estado IN ('recibida', 'en_revision', 'pendiente_correccion')
    `);

    await queryRunner.query(`
      CREATE INDEX idx_permisos_vigentes
        ON permisos (fecha_vencimiento)
        WHERE estado = 'vigente'
    `);

    await queryRunner.query(`
      CREATE INDEX idx_tokens_activos
        ON tokens (token_hash, expira_at)
        WHERE revocado = false
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_motocicletas_placa_activa
        ON motocicletas (placa)
        WHERE deleted_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ================================================================
    // REVERSIÓN — orden inverso al up()
    //
    // 1. Eliminar FK circulares (ALTER TABLE) para desbloquear el drop
    // 2. Drop de tablas en orden inverso de dependencia
    // 3. Drop de secuencia
    // 4. Drop de tipos ENUM
    //
    // Nota: los índices no necesitan drop explícito — se eliminan
    // automáticamente al hacer DROP TABLE.
    // ================================================================

    // 1. Eliminar FK circulares y auto-referencias
    await queryRunner.query(`ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS fk_usuarios_updated_by`);
    await queryRunner.query(`ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS fk_usuarios_created_by`);
    await queryRunner.query(`ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS fk_usuarios_dependencia`);
    await queryRunner.query(`ALTER TABLE dependencias DROP CONSTRAINT IF EXISTS fk_dependencias_updated_by`);
    await queryRunner.query(`ALTER TABLE dependencias DROP CONSTRAINT IF EXISTS fk_dependencias_created_by`);

    // 2. Drop de tablas en orden inverso
    await queryRunner.query(`DROP TABLE configuracion`);
    await queryRunner.query(`DROP TABLE auditoria`);
    await queryRunner.query(`DROP TABLE notificaciones`);
    await queryRunner.query(`DROP TABLE qr_validaciones`);
    await queryRunner.query(`DROP TABLE permisos`);
    await queryRunner.query(`DROP TABLE documentos`);
    await queryRunner.query(`DROP TABLE historial_estados`);
    await queryRunner.query(`DROP TABLE solicitudes`);
    await queryRunner.query(`DROP TABLE motivos`);
    await queryRunner.query(`DROP TABLE motocicletas`);
    await queryRunner.query(`DROP TABLE ciudadanos`);
    await queryRunner.query(`DROP TABLE tokens`);
    await queryRunner.query(`DROP TABLE usuarios`);
    await queryRunner.query(`DROP TABLE dependencias`);
    await queryRunner.query(`DROP TABLE municipios`);
    await queryRunner.query(`DROP TABLE roles`);

    // 3. Drop de secuencia
    await queryRunner.query(`DROP SEQUENCE seq_codigo_permiso`);

    // 4. Drop de tipos ENUM
    await queryRunner.query(`DROP TYPE accion_auditoria`);
    await queryRunner.query(`DROP TYPE tipo_config`);
    await queryRunner.query(`DROP TYPE tipo_documento_adjunto`);
    await queryRunner.query(`DROP TYPE estado_permiso`);
    await queryRunner.query(`DROP TYPE estado_solicitud`);
  }
}
