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

export interface CreateUsuarioData {
  nombre: string;
  apellido: string;
  email: string;
  contrasenaHash: string;
  rolId: string;
  dependenciaId: string | null;
  contrasenaExpiraAt: string;
  createdById: string;
}

export interface RolBrief {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface DependenciaBrief {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface UpdateUsuarioData {
  nombre?: string;
  apellido?: string;
  email?: string;
  rolId?: string;
  /** undefined = no cambiar; null = eliminar dependencia */
  dependenciaId?: string | null;
  activo?: boolean;
  /** undefined = no cambiar; null = desbloquear */
  bloqueadoHasta?: Date | null;
  updatedById: string;
}

export interface IUsuarioRepository {
  findMany(query: ListarUsuariosQuery): Promise<{ items: UsuarioDomainEntity[]; total: number }>;
  findById(id: string): Promise<UsuarioDomainEntity | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByEmailExcluding(email: string, excludeId: string): Promise<boolean>;
  findRol(rolId: string): Promise<RolBrief | null>;
  findDependencia(dependenciaId: string): Promise<DependenciaBrief | null>;
  save(data: CreateUsuarioData): Promise<UsuarioDomainEntity>;
  update(id: string, data: UpdateUsuarioData): Promise<UsuarioDomainEntity>;
}
