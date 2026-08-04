import { MotocicletaDomainEntity } from '../../domain/entities/motocicleta.domain-entity';
import { MotocicletaEntity } from './motocicleta.entity';
import { MotocicletaListItemDto } from '../../application/dtos/motocicleta-list-item.dto';
import { MotocicletaDetalleDto } from '../../application/dtos/motocicleta-detalle.dto';

export class MotocicletaMapper {
  static toDomain(entity: MotocicletaEntity): MotocicletaDomainEntity {
    const domain = new MotocicletaDomainEntity();
    domain.id = entity.id;
    domain.placa = entity.placa;
    domain.marca = entity.marca;
    domain.linea = entity.linea;
    domain.modelo = entity.modelo;
    domain.cilindraje = entity.cilindraje;
    domain.color = entity.color;
    domain.numeroMotor = entity.numeroMotor;
    domain.numeroChasis = entity.numeroChasis;
    domain.activo = entity.activo;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    domain.ciudadanoId = entity.ciudadano.id;
    domain.ciudadanoNombre = entity.ciudadano.nombre;
    domain.ciudadanoApellido = entity.ciudadano.apellido;
    domain.ciudadanoNumeroDocumento = entity.ciudadano.numeroDocumento;
    return domain;
  }

  static toListItemDto(domain: MotocicletaDomainEntity): MotocicletaListItemDto {
    return {
      id: domain.id,
      placa: domain.placa,
      marca: domain.marca,
      linea: domain.linea,
      modelo: domain.modelo,
      cilindraje: domain.cilindraje,
      color: domain.color,
      numeroMotor: domain.numeroMotor,
      numeroChasis: domain.numeroChasis,
      activo: domain.activo,
      ciudadano: {
        id: domain.ciudadanoId,
        nombre: domain.ciudadanoNombre,
        apellido: domain.ciudadanoApellido,
        numeroDocumento: domain.ciudadanoNumeroDocumento,
      },
    };
  }

  static toDetalleDto(domain: MotocicletaDomainEntity): MotocicletaDetalleDto {
    return {
      id: domain.id,
      placa: domain.placa,
      marca: domain.marca,
      linea: domain.linea,
      modelo: domain.modelo,
      cilindraje: domain.cilindraje,
      color: domain.color,
      numeroMotor: domain.numeroMotor,
      numeroChasis: domain.numeroChasis,
      activo: domain.activo,
      ciudadano: {
        id: domain.ciudadanoId,
        nombre: domain.ciudadanoNombre,
        apellido: domain.ciudadanoApellido,
        numeroDocumento: domain.ciudadanoNumeroDocumento,
      },
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt?.toISOString() ?? null,
    };
  }
}
