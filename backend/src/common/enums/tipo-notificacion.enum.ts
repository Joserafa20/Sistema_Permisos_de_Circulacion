/** Almacenado como VARCHAR(50) — no es tipo ENUM nativo de PostgreSQL. */
export enum TipoNotificacion {
  SOLICITUD_RECIBIDA = 'solicitud_recibida',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  CORRECCION = 'correccion',
  SOLICITUD_VENCIDA = 'solicitud_vencida',
  PERMISO_REVOCADO = 'permiso_revocado',
  CORRECCION_ENVIADA = 'correccion_enviada',
  RECUPERACION_CONTRASENA = 'recuperacion_contrasena',
}
