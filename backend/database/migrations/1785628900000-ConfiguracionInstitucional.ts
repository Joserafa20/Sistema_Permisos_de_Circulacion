import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla configuracion_institucional (singleton por instalación).
 * Fuente oficial: docs/MODELO_DATOS.md §9.3
 * Requerida antes de Fase 4 — generación de PDF institucional.
 */
export class ConfiguracionInstitucional1785628900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE configuracion_institucional (
        id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre_alcaldia      VARCHAR(200) NOT NULL,
        nit                  VARCHAR(20)  NOT NULL,
        codigo_dane          VARCHAR(10)  NOT NULL,
        departamento         VARCHAR(100) NOT NULL,
        municipio            VARCHAR(100) NOT NULL,
        direccion            VARCHAR(255) NOT NULL,
        telefono             VARCHAR(20)  NOT NULL,
        correo_institucional VARCHAR(150) NOT NULL,
        sitio_web            VARCHAR(255) NULL,
        escudo_storage_key   VARCHAR(500) NOT NULL,
        logo_storage_key     VARCHAR(500) NULL,
        escudo_hash          VARCHAR(64)  NULL,
        logo_hash            VARCHAR(64)  NULL,
        updated_at           TIMESTAMPTZ  NULL,
        updated_by           UUID         NULL
          REFERENCES usuarios(id) ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      COMMENT ON TABLE configuracion_institucional IS
        'Datos de identidad de la Alcaldía — singleton por instalación. Ref: MODELO_DATOS.md §9.3'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN configuracion_institucional.escudo_storage_key IS
        'Ruta MinIO bucket institucional/. NUNCA exponer directamente — usar URL firmada TTL 5 min'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN configuracion_institucional.logo_storage_key IS
        'Ruta MinIO bucket institucional/. NUNCA exponer directamente — usar URL firmada TTL 5 min'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS configuracion_institucional`);
  }
}
