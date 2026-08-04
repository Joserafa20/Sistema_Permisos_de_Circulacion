import { MotocicletaDomainEntity } from '../entities/motocicleta.domain-entity';

export const MOTOCICLETA_REPOSITORY_TOKEN = Symbol('IMotocicletaRepository');

export interface ListarMotocicletasQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  placa?: string;
  ciudadanoId?: string;
  activo?: boolean;
}

export interface IMotocicletaRepository {
  findMany(
    query: ListarMotocicletasQuery,
  ): Promise<{ items: MotocicletaDomainEntity[]; total: number }>;
  /** Incluye ciudadano propietario */
  findById(id: string): Promise<MotocicletaDomainEntity | null>;
  /** Placa debe llegar normalizada (UPPER + TRIM). Incluye ciudadano propietario */
  findByPlaca(placa: string): Promise<MotocicletaDomainEntity | null>;
}
