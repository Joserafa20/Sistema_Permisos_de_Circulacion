export class UsuarioDomainEntity {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  ultimoLogin: Date | null;
  createdAt: Date;
  rolId: string;
  rolNombre: string;
  dependenciaId: string | null;
  dependenciaNombre: string | null;
  intentosFallidos: number;
  contrasenaExpiraAt: string | null;
  updatedAt: Date | null;
  /** Interno — nunca exponer en DTOs de respuesta */
  bloqueadoHasta: Date | null;
  /** Interno — nunca exponer en DTOs de respuesta */
  deletedAt: Date | null;
}
