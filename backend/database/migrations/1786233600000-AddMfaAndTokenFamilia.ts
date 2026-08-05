import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMfaAndTokenFamilia1786233600000 implements MigrationInterface {
  name = 'AddMfaAndTokenFamilia1786233600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // MFA columns on usuarios
    await queryRunner.query(`
      ALTER TABLE "usuarios"
        ADD COLUMN IF NOT EXISTS "mfa_secret" VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS "mfa_activo" BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS "mfa_recovery_codes" JSONB NOT NULL DEFAULT '[]'
    `);

    // familia column on tokens (for refresh token reuse detection)
    await queryRunner.query(`
      ALTER TABLE "tokens"
        ADD COLUMN IF NOT EXISTS "familia" UUID NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_tokens_familia" ON "tokens" ("familia")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tokens_familia"`);
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN IF EXISTS "familia"`);
    await queryRunner.query(`
      ALTER TABLE "usuarios"
        DROP COLUMN IF EXISTS "mfa_recovery_codes",
        DROP COLUMN IF EXISTS "mfa_activo",
        DROP COLUMN IF EXISTS "mfa_secret"
    `);
  }
}
