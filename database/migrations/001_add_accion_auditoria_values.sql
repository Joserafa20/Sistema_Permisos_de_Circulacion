-- ============================================================
-- Migración 001: Agregar valores al enum accion_auditoria
-- ============================================================
-- Fecha     : 2026-08-03
-- Motivo    : B2.3 y B3 requieren nuevas acciones de auditoría
--             que no estaban en el schema inicial.
-- Contexto  : PostgreSQL no permite eliminar valores de un enum,
--             solo agregar. Ejecutar en orden estricto.
-- ============================================================

-- Paso 1: Agregar 'usuario_consultado' (requerido por B2.3 — GET /usuarios/:id)
ALTER TYPE accion_auditoria ADD VALUE IF NOT EXISTS 'usuario_consultado';

-- Paso 2: Agregar 'usuario_creado' (requerido por B3 — POST /usuarios)
ALTER TYPE accion_auditoria ADD VALUE IF NOT EXISTS 'usuario_creado';

-- ============================================================
-- VERIFICACIÓN (ejecutar después de la migración):
-- SELECT unnest(enum_range(NULL::accion_auditoria));
-- ============================================================
