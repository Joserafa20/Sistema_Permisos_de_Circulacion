-- Migración 006: Agrega el estado 'pendiente_aprobacion' al enum de solicitudes
-- Este estado separa la revisión del funcionario de la aprobación del administrador.

ALTER TYPE estado_solicitud ADD VALUE IF NOT EXISTS 'pendiente_aprobacion' AFTER 'pendiente_correccion';
