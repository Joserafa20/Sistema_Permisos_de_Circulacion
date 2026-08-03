/** Almacenado como VARCHAR(20) — no es tipo ENUM nativo de PostgreSQL. */
export enum EstadoEnvioNotificacion {
  PENDIENTE = 'pendiente',
  ENVIADO = 'enviado',
  ERROR = 'error',
}
