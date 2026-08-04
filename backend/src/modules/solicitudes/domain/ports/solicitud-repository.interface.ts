import { EstadoSolicitud } from '../../../../common/enums';
import { SolicitudDomainEntity } from '../entities/solicitud.domain-entity';

export const SOLICITUD_REPOSITORY_TOKEN = Symbol('ISolicitudRepository');

export interface ListarSolicitudesQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  /** Filtrar por uno o más estados. Por defecto: recibida, en_revision, pendiente_correccion */
  estados?: EstadoSolicitud[];
  /** Filtrar por fecha_inicio >= este valor (YYYY-MM-DD) */
  fechaDesde?: string;
  /** Filtrar por fecha_inicio <= este valor (YYYY-MM-DD) */
  fechaHasta?: string;
  /** Búsqueda parcial sobre ciudadano.numero_documento */
  documento?: string;
  /** Búsqueda parcial (UPPER) sobre motocicleta.placa */
  placa?: string;
  /** Búsqueda parcial sobre numero_radicado */
  radicado?: string;
  motivoId?: string;
}

export interface ISolicitudRepository {
  /** Listado paginado para el panel del funcionario. Sin N+1. */
  findMany(
    query: ListarSolicitudesQuery,
  ): Promise<{ items: SolicitudDomainEntity[]; total: number }>;

  /** Detalle completo: carga historial (con usuario), documentos y permiso. */
  findById(id: string): Promise<SolicitudDomainEntity | null>;

  /** Búsqueda por número de radicado exacto (único). */
  findByNumeroRadicado(numeroRadicado: string): Promise<SolicitudDomainEntity | null>;

  /**
   * Consulta pública de estado: verifica que radicado y número de documento del
   * ciudadano coincidan. RN-20: respuesta idéntica si no existe o si el documento
   * no coincide (no revela información).
   */
  findByRadicadoAndDocumento(
    numeroRadicado: string,
    numeroDocumento: string,
  ): Promise<SolicitudDomainEntity | null>;

  /**
   * Verifica si una moto tiene solicitud activa (RN-03).
   * Estados activos: recibida, en_revision, pendiente_correccion.
   * Retorna el numero_radicado de la solicitud activa si existe.
   */
  hasActivaSolicitud(motocicletaId: string): Promise<{ activa: boolean; numeroRadicado?: string }>;

  /**
   * Transición automática recibida → en_revision al abrir el detalle (PRD §13).
   * Solo ocurre si el estado actual es RECIBIDA. Es atómica: actualiza estado e inserta historial.
   * Retorna true si la transición ocurrió, false si el estado ya era diferente.
   */
  marcarEnRevision(
    id: string,
    usuarioId: string | null,
    ipAddress: string | null,
  ): Promise<boolean>;

  /**
   * Cambia el estado de la solicitud de forma atómica.
   * Usa conditional UPDATE (WHERE estado IN estadosPermitidos) como guarda anti-concurrencia.
   * Inserta en historial_estados dentro de la misma transacción.
   * Retorna false si el estado actual no coincide con estadosPermitidos (ya fue procesada).
   */
  cambiarEstado(params: CambiarEstadoParams): Promise<boolean>;

  /**
   * RN-17: verifica si la motocicleta tiene un permiso vigente cuyas fechas se solapan
   * con el rango [fechaInicio, fechaFin] de la solicitud a aprobar.
   */
  tienePermisoVigenteConSolapamiento(
    motocicletaId: string,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<{ solapamiento: boolean; codigoPermiso?: string }>;
}

export interface CambiarEstadoParams {
  id: string;
  estadoNuevo: EstadoSolicitud;
  /** El UPDATE solo aplica si el estado actual es uno de estos valores. Anti-race condition. */
  estadosPermitidos: EstadoSolicitud[];
  motivo: string | null;
  /** Serializado como objeto JSONB: { items: [...] } o null. */
  camposCorreccion: Record<string, unknown> | null;
  usuarioId: string;
  ipAddress: string | null;
  /** Si la fecha_inicio debe ajustarse (RN-01 al aprobar). */
  fechaInicioAjustada?: string;
}
