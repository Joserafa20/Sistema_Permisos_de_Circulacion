import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  IMotocicletaRepository,
  ListarMotocicletasQuery,
} from '../../domain/ports/motocicleta-repository.interface';
import { MotocicletaDomainEntity } from '../../domain/entities/motocicleta.domain-entity';
import { MotocicletaEntity } from './motocicleta.entity';
import { MotocicletaMapper } from './motocicleta.mapper';

const SORT_FIELD_MAP: Record<string, string> = {
  placa: 'moto.placa',
  marca: 'moto.marca',
  modelo: 'moto.modelo',
  createdAt: 'moto.createdAt',
};

@Injectable()
export class TypeOrmMotocicletaRepository implements IMotocicletaRepository {
  constructor(
    @InjectRepository(MotocicletaEntity)
    private readonly repo: Repository<MotocicletaEntity>,
  ) {}

  async findMany(
    query: ListarMotocicletasQuery,
  ): Promise<{ items: MotocicletaDomainEntity[]; total: number }> {
    const { page, limit, sortBy, sortOrder, placa, ciudadanoId, activo } = query;

    const qb = this.repo
      .createQueryBuilder('moto')
      .innerJoinAndSelect('moto.ciudadano', 'ciudadano')
      .where('moto.deletedAt IS NULL');

    if (placa) {
      // Búsqueda parcial normalizada
      qb.andWhere('moto.placa ILIKE :placa', { placa: `%${placa.trim().toUpperCase()}%` });
    }

    if (ciudadanoId) {
      qb.andWhere('ciudadano.id = :ciudadanoId', { ciudadanoId });
    }

    if (activo !== undefined) {
      qb.andWhere('moto.activo = :activo', { activo });
    }

    const sortColumn = SORT_FIELD_MAP[sortBy] ?? 'moto.placa';
    qb.orderBy(sortColumn, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      items: entities.map(MotocicletaMapper.toDomain),
      total,
    };
  }

  async findById(id: string): Promise<MotocicletaDomainEntity | null> {
    return this.loadDetail({ id });
  }

  async findByPlaca(placa: string): Promise<MotocicletaDomainEntity | null> {
    return this.loadDetail({ placa });
  }

  // ─── Helper privado ────────────────────────────────────────────────────────

  private async loadDetail(
    where: FindOptionsWhere<MotocicletaEntity>,
  ): Promise<MotocicletaDomainEntity | null> {
    const entity = await this.repo.findOne({
      where,
      relations: ['ciudadano'],
      withDeleted: false,
    });
    return entity ? MotocicletaMapper.toDomain(entity) : null;
  }
}
