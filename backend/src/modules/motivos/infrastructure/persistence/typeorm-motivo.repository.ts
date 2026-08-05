import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateMotivoData,
  IMotivoRepository,
  UpdateMotivoData,
} from '../../domain/ports/motivo-repository.interface';
import { MotivoDomainEntity } from '../../domain/entities/motivo.domain-entity';
import { MotivoEntity } from './motivo.entity';
import { MotivoMapper } from './motivo.mapper';

@Injectable()
export class TypeOrmMotivoRepository implements IMotivoRepository {
  constructor(
    @InjectRepository(MotivoEntity)
    private readonly repo: Repository<MotivoEntity>,
  ) {}

  async findById(id: string): Promise<MotivoDomainEntity | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? MotivoMapper.toDomain(entity) : null;
  }

  async findActivos(): Promise<MotivoDomainEntity[]> {
    const entities = await this.repo.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
    return entities.map(MotivoMapper.toDomain);
  }

  async findAll(): Promise<MotivoDomainEntity[]> {
    const entities = await this.repo.find({ order: { orden: 'ASC', nombre: 'ASC' } });
    return entities.map(MotivoMapper.toDomain);
  }

  async create(data: CreateMotivoData): Promise<MotivoDomainEntity> {
    const entity = this.repo.create({
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      requiereSoporte: data.requiereSoporte ?? false,
      orden: data.orden ?? 0,
      activo: true,
    });
    const saved = await this.repo.save(entity);
    return MotivoMapper.toDomain(saved);
  }

  async update(id: string, data: UpdateMotivoData): Promise<MotivoDomainEntity | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    if (data.nombre !== undefined) entity.nombre = data.nombre;
    if (data.descripcion !== undefined) entity.descripcion = data.descripcion ?? null;
    if (data.requiereSoporte !== undefined) entity.requiereSoporte = data.requiereSoporte;
    if (data.orden !== undefined) entity.orden = data.orden;
    const saved = await this.repo.save(entity);
    return MotivoMapper.toDomain(saved);
  }

  async toggleActivo(id: string): Promise<MotivoDomainEntity | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    entity.activo = !entity.activo;
    const saved = await this.repo.save(entity);
    return MotivoMapper.toDomain(saved);
  }
}
