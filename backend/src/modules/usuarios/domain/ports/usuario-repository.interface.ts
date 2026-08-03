import { UsuarioDomainEntity } from '../entities/usuario.domain-entity';

export const USUARIO_REPOSITORY_TOKEN = Symbol('IUsuarioRepository');

export interface ListarUsuariosQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  rolId?: string;
  dependenciaId?: string;
  activo?: boolean;
  busqueda?: string;
}

export interface IUsuarioRepository {
  findMany(query: ListarUsuariosQuery): Promise<{ items: UsuarioDomainEntity[]; total: number }>;
}
