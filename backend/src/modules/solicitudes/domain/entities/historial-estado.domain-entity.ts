import { EstadoSolicitud } from '../../../../common/enums';

export class HistorialEstadoDomainEntity {
  id: string;
  estadoAnterior: EstadoSolicitud | null;
  estadoNuevo: EstadoSolicitud;
  motivo: string | null;
  camposCorreccion: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date;
  /** Null cuando el cambio es automático (job) o es el estado inicial. */
  usuarioId: string | null;
  usuarioNombre: string | null;
  usuarioApellido: string | null;
}
