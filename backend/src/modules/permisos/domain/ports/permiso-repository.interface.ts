import { EstadoPermiso } from '../../../../common/enums';
import {
  PermisoDomainEntity,
  SnapshotCiudadano,
  SnapshotMotocicleta,
  SnapshotMotivo,
} from '../entities/permiso.domain-entity';

export const PERMISO_REPOSITORY_TOKEN = Symbol('IPermisoRepository');

export interface CrearPermisoParams {
  id: string;
  codigoPermiso: string;
  solicitudId: string;
  funcionarioId: string;
  codigoQr: string;
  storageKeyPdf: string;
  fechaExpedicion: Date;
  fechaVencimiento: string;
  estado: EstadoPermiso;
  snapshotCiudadano: SnapshotCiudadano;
  snapshotMotocicleta: SnapshotMotocicleta;
  snapshotMotivo: SnapshotMotivo;
  condicionesRestricciones: string | null;
  hashPdf: string | null;
}

export interface ListarPermisosQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  estado?: EstadoPermiso;
  fechaInicio?: string;
  fechaFin?: string;
  placa?: string;
  documento?: string;
}

export interface IPermisoRepository {
  crear(params: CrearPermisoParams): Promise<PermisoDomainEntity>;
  findById(id: string): Promise<PermisoDomainEntity | null>;
  findMany(query: ListarPermisosQuery): Promise<{ items: PermisoDomainEntity[]; total: number }>;
}
