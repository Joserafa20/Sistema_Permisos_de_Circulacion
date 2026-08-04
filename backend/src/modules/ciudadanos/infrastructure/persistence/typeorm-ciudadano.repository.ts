import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  ICiudadanoRepository,
  ListarCiudadanosQuery,
} from '../../domain/ports/ciudadano-repository.interface';
import { CiudadanoDomainEntity } from '../../domain/entities/ciudadano.domain-entity';
import { CiudadanoEntity } from './ciudadano.entity';
import { CiudadanoMapper } from './ciudadano.mapper';
import { SolicitudEntity } from '../../../solicitudes/infrastructure/persistence/solicitud.entity';

const SORT_FIELD_MAP: Record<string, string> = {
  nombre: 'ciudadano.nombre',
  apellido: 'ciudadano.apellido',
  numeroDocumento: 'ciudadano.numeroDocumento',
  createdAt: 'ciudadano.createdAt',
};

@Injectable()
export class TypeOrmCiudadanoRepository implements ICiudadanoRepository {
  constructor(
    @InjectRepository(CiudadanoEntity)
    private readonly repo: Repository<CiudadanoEntity>,
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepo: Repository<SolicitudEntity>,
  ) {}

  async findMany(
    query: ListarCiudadanosQuery,
  ): Promise<{ items: CiudadanoDomainEntity[]; total: number }> {
    const { page, limit, sortBy, sortOrder, busqueda, tipoDocumento, municipioId } = query;

    const qb = this.repo
      .createQueryBuilder('ciudadano')
      .leftJoinAndSelect('ciudadano.municipio', 'municipio')
      .where('ciudadano.deletedAt IS NULL');

    if (tipoDocumento) {
      qb.andWhere('ciudadano.tipoDocumento = :tipoDocumento', { tipoDocumento });
    }

    if (municipioId) {
      qb.andWhere('municipio.id = :municipioId', { municipioId });
    }

    if (busqueda) {
      const term = `%${busqueda.trim()}%`;
      qb.andWhere(
        '(ciudadano.nombre ILIKE :term OR ciudadano.apellido ILIKE :term OR ciudadano.numeroDocumento ILIKE :term)',
        { term },
      );
    }

    const sortColumn = SORT_FIELD_MAP[sortBy] ?? 'ciudadano.apellido';
    qb.orderBy(sortColumn, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      items: entities.map(CiudadanoMapper.toDomain),
      total,
    };
  }

  async findById(id: string): Promise<CiudadanoDomainEntity | null> {
    return this.loadDetail({ id });
  }

  async findByNumeroDocumento(numeroDocumento: string): Promise<CiudadanoDomainEntity | null> {
    return this.loadDetail({ numeroDocumento });
  }

  // ─── Helper privado ────────────────────────────────────────────────────────

  private async loadDetail(
    where: FindOptionsWhere<CiudadanoEntity>,
  ): Promise<CiudadanoDomainEntity | null> {
    const entity = await this.repo.findOne({
      where,
      relations: ['municipio', 'motocicletas'],
      withDeleted: false,
    });

    if (!entity) return null;

    const domain = CiudadanoMapper.toDomain(entity);

    domain.motocicletas = entity.motocicletas.map((m) => ({
      id: m.id,
      placa: m.placa,
      marca: m.marca,
      modelo: m.modelo,
      activo: m.activo,
    }));

    domain.totalSolicitudes = await this.solicitudRepo.count({
      where: { ciudadano: { id: entity.id } },
    });

    return domain;
  }
}
