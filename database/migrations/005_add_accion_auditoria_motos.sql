-- ============================================================
-- Migración 005: Agregar valores de auditoría del módulo Motocicletas
-- ============================================================
-- Fecha     : 2026-08-04
-- Motivo    : B4 Commit 3 — GET /motocicletas, GET /motocicletas/:id,
--             GET /motocicletas/placa/:placa
-- ============================================================

ALTER TYPE accion_auditoria ADD VALUE IF NOT EXISTS 'motocicleta_consultada';
ALTER TYPE accion_auditoria ADD VALUE IF NOT EXISTS 'listado_motos';

-- ============================================================
-- VERIFICACIÓN:
-- SELECT unnest(enum_range(NULL::accion_auditoria));
-- ============================================================
