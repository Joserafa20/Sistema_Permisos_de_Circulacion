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

/** undefined = no cambiar, null = limpiar el campo, valor = actualizar */
export interface UpdateMotocicletaData {
  marca?: string | null;
  linea?: string | null;
  modelo?: number | null;
  cilindraje?: number | null;
  color?: string | null;
  numeroMotor?: string | null;
  numeroChasis?: string | null;
}

export interface IMotocicletaRepository {
  findMany(
    query: ListarMotocicletasQuery,
  ): Promise<{ items: MotocicletaDomainEntity[]; total: number }>;
  /** Incluye ciudadano propietario */
  findById(id: string): Promise<MotocicletaDomainEntity | null>;
  /** Placa debe llegar normalizada (UPPER + TRIM). Incluye ciudadano propietario */
  findByPlaca(placa: string): Promise<MotocicletaDomainEntity | null>;
  /** Actualiza únicamente los campos presentes en data. Retorna el objeto actualizado */
  update(id: string, data: UpdateMotocicletaData): Promise<MotocicletaDomainEntity>;
}
