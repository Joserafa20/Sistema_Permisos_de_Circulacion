import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUsuarioData,
  DependenciaBrief,
  IUsuarioRepository,
  ListarUsuariosQuery,
  RolBrief,
  UpdateUsuarioData,
} from '../../domain/ports/usuario-repository.interface';
import { UserRole } from '../../../../common/decorators/roles.decorator';
import { UsuarioDomainEntity } from '../../domain/entities/usuario.domain-entity';
import { UsuarioEntity } from './usuario.entity';
import { UsuarioMapper } from './usuario.mapper';
import { RoleEntity } from '../../../roles/infrastructure/persistence/role.entity';
import { DependenciaEntity } from '../../../dependencias/infrastructure/persistence/dependencia.entity';

const SORT_FIELD_MAP: Record<string, string> = {
  nombre: 'usuario.nombre',
  apellido: 'usuario.apellido',
  email: 'usuario.email',
  createdAt: 'usuario.createdAt',
  ultimoLogin: 'usuario.ultimoLogin',
};

@Injectable()
export class TypeOrmUsuarioRepository implements IUsuarioRepository {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly repo: Repository<UsuarioEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolRepo: Repository<RoleEntity>,
    @InjectRepository(DependenciaEntity)
    private readonly dependenciaRepo: Repository<DependenciaEntity>,
  ) {}

  async findMany(
    query: ListarUsuariosQuery,
  ): Promise<{ items: UsuarioDomainEntity[]; total: number }> {
    const { page, limit, sortBy, sortOrder, rolId, dependenciaId, activo, busqueda } = query;

    const qb = this.repo
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .leftJoinAndSelect('usuario.dependencia', 'dependencia')
      .where('usuario.deletedAt IS NULL');

    if (rolId) {
      qb.andWhere('rol.id = :rolId', { rolId });
    }

    if (dependenciaId) {
      qb.andWhere('dependencia.id = :dependenciaId', { dependenciaId });
    }

    if (activo !== undefined) {
      qb.andWhere('usuario.activo = :activo', { activo });
    }

    if (busqueda) {
      const term = `%${busqueda.trim()}%`;
      qb.andWhere(
        '(usuario.nombre ILIKE :term OR usuario.apellido ILIKE :term OR usuario.email ILIKE :term)',
        { term },
      );
    }

    const sortColumn = SORT_FIELD_MAP[sortBy] ?? 'usuario.apellido';
    qb.orderBy(sortColumn, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      items: entities.map(UsuarioMapper.toDomain),
      total,
    };
  }

  async findById(id: string): Promise<UsuarioDomainEntity | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['rol', 'dependencia'],
      withDeleted: false,
    });
    return entity ? UsuarioMapper.toDomain(entity) : null;
  }

  async findByIdWithDeleted(id: string): Promise<UsuarioDomainEntity | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['rol', 'dependencia'],
      withDeleted: true,
    });
    return entity ? UsuarioMapper.toDomain(entity) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repo.count({ where: { email } });
    return count > 0;
  }

  async existsByEmailExcluding(email: string, excludeId: string): Promise<boolean> {
    const count = await this.repo
      .createQueryBuilder('u')
      .where('u.email = :email AND u.id != :excludeId', { email, excludeId })
      .getCount();
    return count > 0;
  }

  async findRol(rolId: string): Promise<RolBrief | null> {
    const rol = await this.rolRepo.findOne({ where: { id: rolId } });
    if (!rol) return null;
    return { id: rol.id, nombre: rol.nombre, activo: rol.activo };
  }

  async findDependencia(dependenciaId: string): Promise<DependenciaBrief | null> {
    const dep = await this.dependenciaRepo.findOne({ where: { id: dependenciaId } });
    if (!dep) return null;
    return { id: dep.id, nombre: dep.nombre, activo: dep.activo };
  }

  async countAdminsActivos(): Promise<number> {
    return this.repo
      .createQueryBuilder('u')
      .innerJoin('u.rol', 'rol')
      .where('rol.nombre = :rol AND u.activo = true AND u.deletedAt IS NULL', {
        rol: UserRole.ADMINISTRADOR,
      })
      .getCount();
  }

  async update(id: string, data: UpdateUsuarioData): Promise<UsuarioDomainEntity> {
    const entity = await this.loadWithRelations(id);

    if (data.nombre !== undefined) entity.nombre = data.nombre;
    if (data.apellido !== undefined) entity.apellido = data.apellido;
    if (data.email !== undefined) entity.email = data.email;
    if (data.rolId !== undefined) entity.rol = { id: data.rolId } as RoleEntity;
    if ('dependenciaId' in data) {
      entity.dependencia = data.dependenciaId
        ? ({ id: data.dependenciaId } as DependenciaEntity)
        : null;
    }
    if (data.activo !== undefined) entity.activo = data.activo;
    if ('bloqueadoHasta' in data) entity.bloqueadoHasta = data.bloqueadoHasta ?? null;
    entity.updatedBy = { id: data.updatedById } as UsuarioEntity;

    await this.repo.save(entity);
    return UsuarioMapper.toDomain(await this.loadWithRelations(id));
  }

  async save(data: CreateUsuarioData): Promise<UsuarioDomainEntity> {
    const entity = this.repo.create({
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      contrasenaHash: data.contrasenaHash,
      rol: { id: data.rolId } as RoleEntity,
      dependencia: data.dependenciaId ? ({ id: data.dependenciaId } as DependenciaEntity) : null,
      contrasenaExpiraAt: data.contrasenaExpiraAt,
      activo: true,
      intentosFallidos: 0,
      historialContrasenas: [],
      createdBy: { id: data.createdById } as UsuarioEntity,
    });
    const saved = await this.repo.save(entity);
    return UsuarioMapper.toDomain(await this.loadWithRelations(saved.id));
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    await this.repo.update(id, { updatedBy: { id: actorId } as UsuarioEntity });
    await this.repo.softDelete(id);
  }

  async restore(id: string, actorId: string): Promise<UsuarioDomainEntity> {
    await this.repo.restore(id);
    await this.repo.update(id, { updatedBy: { id: actorId } as UsuarioEntity });
    return UsuarioMapper.toDomain(await this.loadWithRelations(id));
  }

  // ─── Helper privado ────────────────────────────────────────────────────────

  private async loadWithRelations(id: string): Promise<UsuarioEntity> {
    return this.repo.findOneOrFail({
      where: { id },
      relations: ['rol', 'dependencia'],
    });
  }
}
