import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCondicionesRestriccionesPermiso1785984000000 implements MigrationInterface {
  name = 'AddCondicionesRestriccionesPermiso1785984000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE permisos
        ADD COLUMN IF NOT EXISTS condiciones_restricciones TEXT
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE permisos DROP COLUMN IF EXISTS condiciones_restricciones
    `);
  }
}
