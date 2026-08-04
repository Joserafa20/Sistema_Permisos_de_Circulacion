/** Almacenado como VARCHAR(50) — no es tipo ENUM nativo de PostgreSQL. */
export enum TipoNotificacion {
  SOLICITUD_RECIBIDA = 'solicitud_recibida',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  CORRECCION = 'correccion',
  PERMISO_REVOCADO = 'permiso_revocado',
}
