import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContextoToNotificaciones1786060800000 implements MigrationInterface {
  name = 'AddContextoToNotificaciones1786060800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE notificaciones
      ADD COLUMN IF NOT EXISTS contexto JSONB NULL
    `);
    await queryRunner.query(
      `COMMENT ON COLUMN notificaciones.contexto IS 'Variables de contexto para renderizar el template HTML (snapshot en el momento de encolar)'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE notificaciones DROP COLUMN IF EXISTS contexto`);
  }
}
