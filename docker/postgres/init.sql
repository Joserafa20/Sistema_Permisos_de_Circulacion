-- ══════════════════════════════════════════════════════════════════════════════
-- Sistema de Permisos de Circulación — Inicialización PostgreSQL
-- Este script se ejecuta automáticamente en el PRIMER arranque del contenedor
-- (cuando el volumen postgres_data está vacío).
-- ══════════════════════════════════════════════════════════════════════════════

-- Extensiones requeridas por el sistema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid(), crypt()

-- El esquema de tablas se gestiona exclusivamente mediante migraciones TypeORM.
-- Ver: backend/src/config/typeorm-cli.config.ts
-- Ver: database/migrations/
