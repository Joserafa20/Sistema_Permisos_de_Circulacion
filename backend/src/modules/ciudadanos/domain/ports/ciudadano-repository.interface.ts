import { TipoDocumentoIdentidad } from '../../../../common/enums';
import { CiudadanoDomainEntity } from '../entities/ciudadano.domain-entity';

export const CIUDADANO_REPOSITORY_TOKEN = Symbol('ICiudadanoRepository');

export interface ListarCiudadanosQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  busqueda?: string;
  tipoDocumento?: TipoDocumentoIdentidad;
  municipioId?: string;
}

export interface ICiudadanoRepository {
  findMany(
    query: ListarCiudadanosQuery,
  ): Promise<{ items: CiudadanoDomainEntity[]; total: number }>;
  /** Carga relaciones motocicletas y totalSolicitudes */
  findById(id: string): Promise<CiudadanoDomainEntity | null>;
  /** Carga relaciones motocicletas y totalSolicitudes. Excluye soft-deleted */
  findByNumeroDocumento(numeroDocumento: string): Promise<CiudadanoDomainEntity | null>;
}
