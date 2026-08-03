import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IUsuarioRepository,
  ListarUsuariosQuery,
} from '../../domain/ports/usuario-repository.interface';
import { UsuarioDomainEntity } from '../../domain/entities/usuario.domain-entity';
import { UsuarioEntity } from './usuario.entity';
import { UsuarioMapper } from './usuario.mapper';

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
}
