/** Almacenado como VARCHAR(20) — no es tipo ENUM nativo de PostgreSQL. */
export enum ResultadoQrValidacion {
  VIGENTE = 'vigente',
  VENCIDO = 'vencido',
  REVOCADO = 'revocado',
  NO_ENCONTRADO = 'no_encontrado',
}
