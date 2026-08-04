import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMotivoRepository } from '../../domain/ports/motivo-repository.interface';
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
}
