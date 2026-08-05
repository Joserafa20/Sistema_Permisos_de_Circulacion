-- ============================================================
-- Migración 002: Agregar valores de auditoría de actualización
-- ============================================================
-- Fecha     : 2026-08-03
-- Motivo    : B3 Commit 4 — PUT /usuarios/:id requiere
--             nuevas acciones de auditoría.
-- ============================================================

ALTER TYPE accion_auditoria ADD VALUE IF NOT EXISTS 'usuario_actualizado';
ALTER TYPE accion_auditoria ADD VALUE IF NOT EXISTS 'usuario_desbloqueado';

-- ============================================================
-- VERIFICACIÓN:
-- SELECT unnest(enum_range(NULL::accion_auditoria));
-- ============================================================
