-- ============================================================
-- Migración 003: Agregar valores de auditoría de eliminación y restauración
-- ============================================================
-- Fecha     : 2026-08-03
-- Motivo    : B3 Commit 5 — DELETE /usuarios/:id y
--             POST /usuarios/:id/restaurar requieren
--             nuevas acciones de auditoría.
-- ============================================================

ALTER TYPE accion_auditoria ADD VALUE IF NOT EXISTS 'usuario_eliminado';
ALTER TYPE accion_auditoria ADD VALUE IF NOT EXISTS 'usuario_restaurado';

-- ============================================================
-- VERIFICACIÓN:
-- SELECT unnest(enum_range(NULL::accion_auditoria));
-- ============================================================
