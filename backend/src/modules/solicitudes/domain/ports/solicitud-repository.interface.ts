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
}
