-- ============================================================
-- Migración 004: Agregar valores de auditoría del módulo Ciudadanos
-- ============================================================
-- Fecha     : 2026-08-03
-- Motivo    : B4 Commit 1 — GET /ciudadanos y GET /ciudadanos/:id
-- ============================================================

ALTER TYPE accion_auditoria ADD VALUE IF NOT EXISTS 'ciudadano_consultado';
ALTER TYPE accion_auditoria ADD VALUE IF NOT EXISTS 'listado_ciudadanos';

-- ============================================================
-- VERIFICACIÓN:
-- SELECT unnest(enum_range(NULL::accion_auditoria));
-- ============================================================
