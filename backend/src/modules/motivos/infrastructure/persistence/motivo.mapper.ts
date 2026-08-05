import { MotivoDomainEntity } from '../../domain/entities/motivo.domain-entity';
import { MotivoEntity } from './motivo.entity';

export class MotivoMapper {
  static toDomain(entity: MotivoEntity): MotivoDomainEntity {
    const domain = new MotivoDomainEntity();
    domain.id = entity.id;
    domain.nombre = entity.nombre;
    domain.descripcion = entity.descripcion;
    domain.requiereSoporte = entity.requiereSoporte;
    domain.activo = entity.activo;
    domain.orden = entity.orden;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    return domain;
  }
}
